import { IFunction } from "aws-cdk-lib/aws-lambda";
import { S3EventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";

export interface IS3Props {
  bucketName: string;
  lambda?: IFunction;
  bucketEvents?: [s3.EventType];
}

export class S3 extends Construct {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: IS3Props) {
    super(scope, id);
    const { bucketName, lambda, bucketEvents } = props;

    this.bucket = new s3.Bucket(this, id, {
      bucketName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    if (lambda && bucketEvents) {
      lambda.addEventSource(
        new S3EventSource(this.bucket, {
          events: bucketEvents,
        })
      );
    }
  }
}
