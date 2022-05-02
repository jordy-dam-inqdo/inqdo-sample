// STEPFUNCTION
type OutPutPathType = '$.Payload'

export interface IStepFunctionProps {
  outputPath: OutPutPathType;
  taskDescription: string;
}

export interface IStepFunctionTasks {
  [key: string]: any
}
