import { ProjectType } from "../ProjectType.js";

export class Maven implements ProjectType {
  constructor() {}
  versionCommands() {
    return { ruby: "--version" };
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
