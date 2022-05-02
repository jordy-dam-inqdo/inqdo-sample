import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from 'constructs';
import { globalTags } from "../config";

export interface ISourceProps {
  lambda: IFunction;
  source: string
}

export interface IEventBridge {
  eventBusName: string;
  sourceProps: Array<ISourceProps>
}

export class EventBridge extends Construct {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: IEventBridge) {
    super(scope, id);

    const { eventBusName, sourceProps } = props;

    const bus = new EventBus(this, globalTags['projectName'], {
      eventBusName,
    });

    sourceProps.forEach(prop => {
      const rule = new Rule(this, `${prop.source}-rule`, {
        eventPattern: {
          source: [`invoke.${prop.source}`],
        },
        eventBus: bus,
      });
      rule.addTarget(new targets.LambdaFunction(prop.lambda));
    })
  }
}
