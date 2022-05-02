import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from 'constructs';
import { IGetPolicyProps, IPoliciesProps } from "../interfaces/policy";
import { pfx } from "../shared/utils";
import { resourceNames } from './index';

export class Policy extends cdk.Stack {
  policies: IPoliciesProps;

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    this.policies = {
      "CoreStack": {
        "lambda": { // LAMBDA NAME
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Action: ["dynamodb:PutItem", "dynamodb:DescribeTable"],
              Resource: `arn:aws:dynamodb:eu-west-1:${process.env.AWS_ACCOUNT_ID}:table/${resourceNames.testDatabase}`,
            },
          ],
        }
      },
    };
  }

  public get(props: IGetPolicyProps) {
    const { stackName, lambdaName } = props;
    const document = iam.PolicyDocument.fromJson(this.policies[stackName][lambdaName]);
    const policy = new iam.ManagedPolicy(this, pfx(`${lambdaName}-policy`), {
      document: document,
    });

    return policy;
  }
}
