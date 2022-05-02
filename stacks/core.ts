import { App, Stack, StackProps } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";
import * as logs from "aws-cdk-lib/aws-logs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import { IStateMachine } from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import * as path from "path";
import { FunctionConfig } from "../config/functionConfig";
import { resourceNames } from '../config/index';
import { DynamoDb } from '../constructs/dynamodb';
import { EventBridge, ISourceProps } from "../constructs/eventBridge";
import { ISchedule, Schedule } from "../constructs/schedule";
import {
  ILambaFunctions,
  ILambdaApiResourceObject
} from "../interfaces/lambda";
import { IStepFunctionTasks } from "../interfaces/stepfunctions";
import { notEmpty, pfx } from "../shared/utils";

interface ICoreStack extends StackProps {
  stage: string;
}

// CORE STACK
export class CoreStack extends Stack {
  stateMachine: IStateMachine;
  stepFunctionTasks: IStepFunctionTasks = {};

  lambdaScheduleTriggers: Array<ISchedule> = []; // SCHEDULE
  lambdaApiResources: ILambdaApiResourceObject = {}; // API RESOURCES
  lambdaFunctions: ILambaFunctions = {}; // LAMBDA FUNCTIONS

  constructor(scope: App, id: string, props: ICoreStack) {
    super(scope, id, props);

    // DYNAMO DB
    new DynamoDb(this, "DynamoDb", {
      tableName: resourceNames.testDatabase,
      partitionKey: "name",
      partitionType: "string",
    });

    // EVENT BRIDGE PROPS
    const eventBridgeProps: Array<ISourceProps> = [];

    // GET FUNCTIONS CONFIG
    const functionConfig = new FunctionConfig(this, "FuntionConfig")
      .coreStackFunctions;

    // LOOP TROUGH FUNCTION CONFIG
    Object.keys(functionConfig).forEach((func) => {
      const functionName = func;
      const functionProps = functionConfig[functionName];

      // CREARTE DOCKER IMAGE FUNCTION
      const dockerImageFunction = new lambda.DockerImageFunction(
        this,
        functionName,
        {
          code: lambda.DockerImageCode.fromImageAsset(
            path.join(__dirname, `../src/${functionName}`),
            {
              file: "Dockerfile.prd",
            }
          ),
          functionName: pfx(functionName),
          description: functionProps.description,
          vpc: functionProps.vpc,
          timeout: functionProps.duration,
          environment: functionProps.environment,
          securityGroups: functionProps.securityGroups
            ? functionProps.securityGroups
            : undefined,
        }
      );

      // STEPFUNCTION TASKS
      if (functionProps.stepFunction) {
        const { outputPath, taskDescription } = functionProps.stepFunction;

        this.stepFunctionTasks = {
          ...this.stepFunctionTasks,
          [functionName]: new tasks.LambdaInvoke(this, taskDescription, {
            lambdaFunction: dockerImageFunction,
            outputPath,
          }),
        };
      }

      // GET MANAGED POLICY
      this.lambdaFunctions[functionName] = {
        function: dockerImageFunction,
      };

      // FAST API TRIGGER
      if (functionProps.fastApi) {
        const { fastApi, withCognito } = functionProps.fastApi;

        Object.keys(fastApi).forEach((resource) => {
          const method = fastApi[resource];

          const props = {
            resourcePath: resource,
            methodsLambda: {
              [method]: dockerImageFunction,
            },
            withCognito,
          };

          if (Object.keys(this.lambdaApiResources).includes(functionName)) {
            this.lambdaApiResources[functionName].push(props);
          } else {
            this.lambdaApiResources[functionName] = [props];
          }
        });
      }

      // API TRIGGER
      if (functionProps.api) {
        const { resource, method, withCognito, withApiKey, queryParameter } = functionProps.api;

        this.lambdaApiResources[functionName] = [
          {
            resourcePath: resource,
            methodsLambda: {
              [method]: dockerImageFunction,
            },
            withApiKey,
            withCognito,
            queryParameter
          },
        ];
      }

      // SQS TRIGGER
      if (functionProps.sqs) {
        const queue = sqs.Queue.fromQueueArn(
          this,
          `${functionName}-queue`,
          functionProps.sqs.queueArn
        );
        const eventSource = new lambdaEventSources.SqsEventSource(queue);

        dockerImageFunction.addEventSource(eventSource);
      }

      // SET EVENT BRIDGE PROPS
      if (functionProps.eventBridgeSource) {
        eventBridgeProps.push({
          lambda: dockerImageFunction,
          source: functionProps.eventBridgeSource,
        });
      }
    });

    if (notEmpty(this.stepFunctionTasks)) {
      // ** EXAMPLE STATE MACHINE

      // DEFINITION
      const stateMachineDefinition = this.stepFunctionTasks[
        "step-function-handler"
      ].next(
        new sfn.Choice(this, "version check")
          .when(
            sfn.Condition.stringEquals("$.version", "1.3"),
            this.stepFunctionTasks["sf-version-1-3"]
          )
          .when(
            sfn.Condition.stringEquals("$.version", "2.0"),
            this.stepFunctionTasks["sf-version-2-0"]
          )
          .otherwise(this.stepFunctionTasks["sf-version-fail"])
      );

      // CREATE LOG GROUP
      const logGroup = new logs.LogGroup(this, "StateMachineLogGroup", {
        logGroupName: "stepfunctionApi",
        retention: RetentionDays.FIVE_DAYS,
      });

      // STATE MACHINE
      this.stateMachine = new sfn.StateMachine(this, "Statemachine", {
        definition: stateMachineDefinition,
        stateMachineType: sfn.StateMachineType.EXPRESS,
        logs: {
          destination: logGroup,
          level: sfn.LogLevel.ALL,
        },
      });
    }

    // EVENT BRIDGE
    if (eventBridgeProps.length > 0) {
      new EventBridge(this, `${id}-eventbus`, {
        sourceProps: eventBridgeProps,
        eventBusName: `${id}-eventbus`,
      });
    }

    // SCHEDLUES
    if (this.lambdaScheduleTriggers.length > 0) {
      this.lambdaScheduleTriggers.forEach((props, index) => {
        new Schedule(this, `${id}-schedule-${index}`, props);
      });
    }
  }
}
