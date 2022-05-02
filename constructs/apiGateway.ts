import { aws_iam } from "aws-cdk-lib";
import * as aws_apigateway from "aws-cdk-lib/aws-apigateway";
import { IUserPool } from "aws-cdk-lib/aws-cognito";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { IStateMachine } from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { MethodType } from "../interfaces/lambda";

interface IProps {
  function: IFunction;
  queryParameter?: string;
  withCognito?: boolean;
  withApiKey?: boolean;
}

export interface IMethodProps {
  [key: string]: IProps;
}

export interface IMethodsLambda {
  GET?: IFunction;
  POST?: IFunction;
  DELETE?: IFunction;
  PUT?: IFunction;
  ANY?: IFunction;
}

export interface IMethodQueryProps {
  [key: string]: Array<MethodType>;
}

interface IMethodsStepFunction {
  GET?: IStateMachine;
  POST?: IStateMachine;
  DELETE?: IStateMachine;
  PUT?: IStateMachine;
  ANY?: IStateMachine;
}

interface IStepFunctionRestApiProps {
  stateMachine: IStateMachine;
  description?: string;
}

interface IApiGatewayProps {
  apiId: string;
  restApiName: string;
  withKey?: boolean;
  cognitoPool?: IUserPool;
  stepFunctionRestApiProps?: IStepFunctionRestApiProps;
}

export interface IResourceProps {
  resourcePath: string;
  methodsLambda?: IMethodsLambda;
  methodsStepFunction?: IMethodsStepFunction;
  methodQueryProps?: IMethodQueryProps;
  methodProps?: IMethodProps;
  queryParameter?: string;
  withCognito?: boolean;
  withApiKey?: boolean;
}

export class ApiGateway extends Construct {
  resourceMethods: aws_apigateway.Resource[];
  methodsLambda: IMethodsLambda;
  methodsStepFunction: IMethodsStepFunction;
  api: any;
  apiId: string;
  withKey?: boolean;
  url: string;
  auth: any;

  constructor(scope: Construct, id: string, props: IApiGatewayProps) {
    super(scope, id);
    const {
      apiId,
      withKey,
      restApiName,
      cognitoPool,
      stepFunctionRestApiProps,
    } = props;

    this.withKey = withKey;
    this.apiId = apiId;

    if (stepFunctionRestApiProps) {
      // CREATE STEP FUNCTION EXPRESS API
      this.api = new aws_apigateway.StepFunctionsRestApi(this, apiId, {
        stateMachine: stepFunctionRestApiProps.stateMachine,
        description: stepFunctionRestApiProps.description,
        headers: true,
        path: true,
        querystring: false,
        requestContext: {
          caller: true,
          user: true,
        },
      });
    } else {
      // CREATE REST API
      this.api = new aws_apigateway.RestApi(this, apiId, {
        restApiName: restApiName,
      });
    }

    this.url = this.api.url;

    if (cognitoPool) {
      // Create Congito Authorizer
      this.auth = new aws_apigateway.CognitoUserPoolsAuthorizer(
        this,
        "APICognitoAuthorizer",
        {
          cognitoUserPools: [cognitoPool],
        }
      );
    }
  }

  public addResource = (props: IResourceProps) => {
    const {
      resourcePath,
      methodProps,
      methodsStepFunction,
      withCognito,
      withApiKey,
      methodQueryProps,
    } = props;
    const resource = this.api.root.addResource(resourcePath);
    addCorsOptions(resource);

    let resourceMethods = undefined;
    const resourceWithQuery: any = {};

    if (methodsStepFunction) {
      resourceMethods = Object.keys(methodsStepFunction).map((method) => {
        let intergration;

        const stateMachine =
          methodsStepFunction[method as keyof IMethodsStepFunction];

        const mProps = {
          apiKeyRequired: this.withKey,
          authorizationType: withCognito
            ? aws_apigateway.AuthorizationType.COGNITO
            : aws_apigateway.AuthorizationType.NONE,
          authorizer: withCognito ? this.auth : undefined,
        };

        if (stateMachine) {
          const credentialsRole = new aws_iam.Role(this, "getRole", {
            assumedBy: new aws_iam.ServicePrincipal("apigateway.amazonaws.com"),
          });

          credentialsRole.attachInlinePolicy(
            new aws_iam.Policy(this, "getPolicy", {
              statements: [ // DEFINE STATEMENTS
                new aws_iam.PolicyStatement({
                  actions: ["states:StartExecution"],
                  effect: aws_iam.Effect.ALLOW,
                  resources: [stateMachine.stateMachineArn],
                }),
              ],
            })
          );
          intergration = aws_apigateway.StepFunctionsIntegration.startExecution(
            stateMachine,
            {
              credentialsRole,
              requestTemplates: {
                "application/json": JSON.stringify({
                  input: `$util.escapeJavaScript($input.json('$'))`,
                  stateMachineArn: stateMachine.stateMachineArn,
                }),
              },
            }
          );

          return resource.addMethod(method, intergration, {
            ...mProps,
            operationName: "Submit version",
            requestValidatorOptions: { validateRequestBody: true },
            requestModels: {
              "application/json": new aws_apigateway.Model(
                this,
                "feedbackFormPayload",
                {
                  restApi: this.api,
                  schema: {
                    schema: aws_apigateway.JsonSchemaVersion.DRAFT4,
                    title: "Feedback Form Payload",
                    type: aws_apigateway.JsonSchemaType.OBJECT,
                    required: ["version"],
                    properties: {
                      version: {
                        type: aws_apigateway.JsonSchemaType.STRING,
                        minLength: 1,
                      },
                    },
                  },
                }
              ),
            },
            methodResponses: [{ statusCode: "200" }],
          });
        }
      });
    }

    if (methodProps) {
      resourceMethods = Object.keys(methodProps).map((method) => {
        let intergration;
        const {
          withApiKey,
          withCognito,
          queryParameter,
          function: lambdaFunction,
        } = methodProps[method as keyof IMethodsLambda];
        const lambda = lambdaFunction;

        const mProps = {
          apiKeyRequired: withApiKey,
          authorizationType: withCognito
            ? aws_apigateway.AuthorizationType.COGNITO
            : aws_apigateway.AuthorizationType.NONE,
          authorizer: withCognito ? this.auth : undefined,
        };

        if (lambda) {
          intergration = new aws_apigateway.LambdaIntegration(lambda, {
            allowTestInvoke: false,
            integrationResponses: [
              {
                statusCode: "200",
                responseTemplates: {
                  "application/json": JSON.stringify({
                    body: "$util.escapeJavaScript($input.body)",
                  }),
                },
              },
            ],
            requestTemplates: {
              "application/json": JSON.stringify({
                body: "$util.escapeJavaScript($input.body)",
              }),
            },
          });
        }

        if (method === "ANY") {
          const any = resource.addResource("{any}");
          addCorsOptions(any);
          return any.addMethod(method, intergration, mProps);
        } else {
          resource.addMethod(method, intergration, mProps);
          if (queryParameter) {
            if (Object.keys(resourceWithQuery).includes(queryParameter)) {
              resourceWithQuery[queryParameter] = {
                [method]: {
                  intergration,
                  mProps,
                },
                ...resourceWithQuery[queryParameter],
              };
            } else {
              resourceWithQuery[queryParameter] = {
                [method]: {
                  intergration,
                  mProps,
                },
              };
            }
          }
        }
      });

      if (methodQueryProps) {
        console.log(methodQueryProps);
        Object.keys(methodQueryProps).forEach((key) => {
          const methods = methodQueryProps[key];
          const qResource = resource.addResource(`{${key}}`);
          addCorsOptions(qResource);
          methods.forEach((m) => {
            const { intergration, mProps } = resourceWithQuery[key][m];
            qResource.addMethod(m, intergration, mProps);
          });
        });
      }

      // methodQueryProps

      if (withApiKey && resourceMethods) {
        resourceMethods.forEach((method, index) => {
          const key = this.api.addApiKey(`${this.apiId}-key-${index + 1}`);
          const planId = `${this.apiId}-plan-${index + 1}`;
          const plan = this.api.addUsagePlan(planId, {
            name: planId,
            apiKey: key,
            throttle: {
              rateLimit: 10,
              burstLimit: 2,
            },
          });
          plan.addApiStage({
            stage: this.api.deploymentStage,
            throttle: [
              {
                method: method,
                throttle: {
                  rateLimit: 10,
                  burstLimit: 2,
                },
              },
            ],
          });
        });
      }
    }
  };
}

export function addCorsOptions(apiResource: aws_apigateway.IResource) {
  apiResource.addMethod(
    "OPTIONS",
    new aws_apigateway.MockIntegration({
      integrationResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers":
              "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
            "method.response.header.Access-Control-Allow-Origin": "'*'",
            "method.response.header.Access-Control-Allow-Credentials":
              "'false'",
            "method.response.header.Access-Control-Allow-Methods":
              "'OPTIONS,GET,PUT,POST,DELETE'",
          },
        },
      ],
      passthroughBehavior: aws_apigateway.PassthroughBehavior.NEVER,
      requestTemplates: {
        "application/json": '{"statusCode": 200}',
      },
    }),
    {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
            "method.response.header.Access-Control-Allow-Credentials": true,
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
      ],
    }
  );
}
