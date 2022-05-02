import { Duration } from "aws-cdk-lib";
import { Rule, Schedule as awsSchedule } from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface ISchedule {
  lambda: IFunction,
  ruleName?: string
  rate?: Duration
  enabled?: Boolean
}

export class Schedule extends Construct {

  constructor(scope: Construct, id: string, props: ISchedule) {
    super(scope, id);

    const { lambda, rate, ruleName, enabled } = props;
    let schedule;

    if (rate) {
      schedule = awsSchedule.rate(rate);
    }

    const rule = new Rule(this, id, {
      ruleName,
      schedule,
      enabled: enabled === false ? false : true
    });

    rule.addTarget(new targets.LambdaFunction(lambda));
  }
}
