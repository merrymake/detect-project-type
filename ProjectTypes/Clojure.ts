import { ProjectType } from "../ProjectType.js";

export class Maven implements ProjectType {
  constructor() {}
  versionCommands() {
    return {};
  }
  async build(folder: string) {
    const buildCommands: string[] = [];
    buildCommands.push(``);
    return buildCommands;
  }
  async runCommand(folder: string) {
    return ``;
  }
}