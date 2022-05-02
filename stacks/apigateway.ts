// import { UserPool } from "aws-cdk-lib/aws-cognito";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { vars } from "../config";
import {
  ApiGateway,
  IMethodProps,
  IMethodQueryProps,
  IMethodsLambda
} from "../constructs/apiGateway";
import { ILambdaApiResourceObject, MethodType } from "../interfaces/lambda";

interface IResources {
  [key: string]: IMethodProps;
}

interface IApiGatewayStackProps extends cdk.StackProps {
  coreLambdaTriggers: ILambdaApiResourceObject;
}

export class ApiGatewayStack extends cdk.Stack {
  url: string;

  constructor(scope: Construct, id: string, props: IApiGatewayStackProps) {
    super(scope, id, props);

    const { coreLambdaTriggers } = props;

    // IMPORRTED COGNITO POOL
    // const cognitoPool = UserPool.fromUserPoolId(
    //   this,
    //   `${id}-userpool`,
    //   userpoolIds[vars.stage]
    // );

    // API GATEWAY
    const api = new ApiGateway(this, "api", {
      apiId: `${vars.projectName}-ApiId`,
      restApiName: `${vars.projectName}-ApiGateway`,
      // cognitoPool,
    });

    const resources: IResources = {};

    this.url = api.url;

    const stacks = [coreLambdaTriggers];

    stacks.forEach((stack) => {
      Object.keys(stack).forEach((key) => {
        const lambdaObject = stack[key][0];
        const { queryParameter, withApiKey, withCognito, resourcePath } =
          lambdaObject;
        if (lambdaObject.methodsLambda) {
          const method = Object.keys(lambdaObject.methodsLambda)[0];
          const lambdaFunction =
            lambdaObject.methodsLambda[method as keyof IMethodsLambda];
          if (lambdaFunction) {
            if (Object.keys(resources).includes(lambdaObject.resourcePath)) {
              resources[lambdaObject.resourcePath] = {
                [method]: {
                  function: lambdaFunction,
                  queryParameter,
                  withApiKey,
                  withCognito,
                },
                ...resources[resourcePath],
              };
            } else {
              resources[resourcePath] = {
                [method]: {
                  function: lambdaFunction,
                  queryParameter,
                  withApiKey,
                  withCognito,
                },
              };
            }
          }
        }
      });
    });

    Object.keys(resources).forEach((key) => {
      const methodProps: IMethodProps = {};
      const methodQueryProps: IMethodQueryProps = {};
      const methods = Object.keys(resources[key]);

      methods.forEach((m) => {
        const method = m as MethodType;
        const queryParameter = resources[key][m].queryParameter;
        methodProps[m] = {
          ...resources[key][m],
        };

        if (queryParameter) {
          if (Object.keys(methodQueryProps).includes(queryParameter)) {
            methodQueryProps[queryParameter].push(method);
          } else {
            methodQueryProps[queryParameter] = [method];
          }
        }
      });
      api.addResource({
        resourcePath: key,
        methodProps,
        methodQueryProps,
      });
    });
  }
}
