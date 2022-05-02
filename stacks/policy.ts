import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Policy } from '../config/policy';
import { ILambaFunctions } from "../interfaces/lambda";
import { notEmpty } from '../shared/utils';

interface IPolicyStackProps extends cdk.StackProps {
  coreLambdaFunctions: ILambaFunctions;
}

export class PolicyStack extends cdk.Stack {
  url: string;

  constructor(scope: Construct, id: string, props: IPolicyStackProps) {
    super(scope, id, props);

    const { coreLambdaFunctions } = props;

    // GET POLICY CLASS
    const policy = new Policy(this, `Policy`, props);

    // ADD MANAGED POLICY
    if (notEmpty(coreLambdaFunctions)) {
      Object.keys(coreLambdaFunctions).forEach((functionName) => {
        const dockerFunction = coreLambdaFunctions[functionName].function;
        dockerFunction.role?.addManagedPolicy(
          policy.get({
            stackName: "CoreStack",
            lambdaName: functionName,
          })
        );
      });
    }
  }
}
