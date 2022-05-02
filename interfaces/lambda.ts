
import { Duration } from 'aws-cdk-lib';
import { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { IResourceProps } from '../constructs/apiGateway';
import { IStepFunctionProps } from './stepfunctions';


export type MethodType = 'DELETE' | 'POST' | 'GET' | 'ANY'

interface IFastApi {
  [key: string]: MethodType
}

interface IFastApiProps {
  withCognito?: boolean;
  withApiKey?: boolean;
  fastApi: IFastApi
}

interface IApiProps {
  resource: string;
  method: MethodType;
  queryParameter?: string;
  withCognito?: boolean;
  withApiKey?: boolean;
}

interface IEnvironment {
  [key: string]: string
}

interface ISqs {
  queueArn: string;
}

interface ILambdaProps {
  description: string;
  duration: Duration;
  environment: IEnvironment;
  api?: IApiProps;
  fastApi?: IFastApiProps
  schedule?: string | Array<string>;
  eventBridgeSource?: string;
  vpc?: IVpc;
  stepFunction?: IStepFunctionProps
  securityGroups?: Array<ISecurityGroup>;
  sqs?: ISqs;
}

interface ILambdaApiObjectProps {
  api: IApiProps,
  function: IFunction
}

interface ILambdFunctionsProps {
  function: IFunction;
}

export interface ILambdaConfig {
  [key: string]: ILambdaProps
}

export interface ILambdaApiObject {
  [key: string]: ILambdaApiObjectProps
}

export interface ILambdaApiResourceObject {
  [key: string]: Array<IResourceProps>
}

export interface ILambaFunctions {
  [key: string]: ILambdFunctionsProps;
}
