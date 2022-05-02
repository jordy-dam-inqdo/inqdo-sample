import { pfx } from "../shared/utils";

type StageType = "dev" | "tst" | "acc" | "prd";

// GLOBAL TAGS
export const globalTags = {
  projectName: "project-name",
};

// VARIABLES
export const vars = {
  projectName: globalTags.projectName,
  region: "eu-west-1", // DEFAULT REGION
  stage: process.env["CDK_DEPLOY_STAGE"] ? process.env["CDK_DEPLOY_STAGE"] as StageType : "dev",
};

// RESOURCE NAMES
export const resourceNames = {
  testDatabase: pfx('test-database'),
}
