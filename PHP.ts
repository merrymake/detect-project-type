import { ProjectType } from "./ProjectType";

export class Maven implements ProjectType {
  constructor() {}
  versionCommands() {
    return { php: "--version" };
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
