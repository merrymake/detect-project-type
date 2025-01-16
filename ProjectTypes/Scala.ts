import { ProjectType } from "../ProjectType.js";

export class Maven implements ProjectType {
  constructor() {}
  versionCommands() {
    return { "scala-cli": "version" };
  }
  async build(folder: string) {
    const buildCommands: string[] = [];
    buildCommands.push(``);
    return buildCommands;
  }
  async runCommand(folder: string) {
    return ``;
  }
  async update(folder: string): Promise<string[]> {
    throw "TODO";
  }
  async upgrade(folder: string): Promise<string[]> {
    throw "TODO";
  }
}
