import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export interface IDynamodbProps {
  tableName: string;
  partitionKey: string;
  partitionType: "string" | "number" | "binary";
  sortKey?: string;
  sortKeyType?: "string" | "number" | "binary";
}

const AttributeTypes = {
  string: dynamodb.AttributeType.STRING,
  number: dynamodb.AttributeType.NUMBER,
  binary: dynamodb.AttributeType.BINARY,
};

export class DynamoDb extends Construct {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: IDynamodbProps) {
    super(scope, id);
    const { tableName, partitionKey, partitionType, sortKey, sortKeyType } =
      props;

    let dynamodbProps = {
      tableName: tableName,
      partitionKey: {
        name: partitionKey,
        type: AttributeTypes[partitionType],
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    };

    if (sortKey && sortKeyType) {
      const sortKeyProps = {
        sortKey: {
          name: sortKey,
          type: AttributeTypes[sortKeyType],
        },
      };

      dynamodbProps = {
        ...dynamodbProps,
        ...sortKeyProps,
      };
    }

    this.table = new dynamodb.Table(this, id, dynamodbProps);
  }
}
