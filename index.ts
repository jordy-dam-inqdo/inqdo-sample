#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import * as config from "./config";

import { ApiGatewayStack } from "./stacks/apigateway";
import { CoreStack } from "./stacks/core";
import { PolicyStack } from "./stacks/policy";

const app = new cdk.App();

// GET BASE INFO
const { projectName } = config.globalTags;

Object.entries(config.globalTags).forEach(([key, value]) =>
  cdk.Tags.of(app).add(key, value)
);

// AWS ENV
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: config.vars.region,
};

// CORE STACK
const core = new CoreStack(
  app,
  `CoreStack-${projectName}-${config.vars.stage}`,
  {
    env,
    stage: config.vars.stage,
  }
);

// create api gateway
new ApiGatewayStack(
  app,
  `ApiGatewayStack-${projectName}-${config.vars.stage}`,
  {
    env,
    coreLambdaTriggers: core.lambdaApiResources,
  }
);

// POLICIES
new PolicyStack(app, `PolicyStack-${projectName}-${config.vars.stage}`, {
  env,
  coreLambdaFunctions: core.lambdaFunctions,
});
