export type StackNameTypes = "CoreStack"


type ArrayOrStringType = Array<string> | string;

interface IStatement {
  Effect: string;
  Action: ArrayOrStringType;
  Resource: ArrayOrStringType;
}

interface IPolicyObject {
  Version: string;
  Statement: Array<IStatement>;
}

interface IPolicy {
  [key: string]: IPolicyObject;
}

export interface IPoliciesProps {
  [key: string]: IPolicy;
}

export interface IGetPolicyProps {
  stackName: StackNameTypes;
  lambdaName: string;
}
