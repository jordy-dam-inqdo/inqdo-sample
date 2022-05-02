import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { vars } from '.';
import { ILambdaConfig } from '../interfaces/lambda';
import { resourceNames } from './index';

export class FunctionConfig extends Construct {
  coreStackFunctions: ILambdaConfig;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // STACK FUNCTIONS
    this.coreStackFunctions = {
      "lambda": { // FUNCTION NAME
        description: "Default lambda",
        duration: Duration.seconds(30),
        environment: {
          STAGE: vars.stage,
          TABLE_NAME: resourceNames.testDatabase
        },
        api: {
          resource: 'files',
          method: 'GET',
          queryParameter: "filename"
        },
      },
    }
  }
}
