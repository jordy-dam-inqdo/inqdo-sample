import { vars } from "../config";

export const notEmpty = (obj: object) => Object.keys(obj).length > 0;
export const pfx = (value: string) => `${vars.projectName}-${value}-${vars.stage}`;

export interface IDockerFileProps {
  folder: string;
  fileName: string;
}

