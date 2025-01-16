import { ProjectType } from "../ProjectType.js";

export class Go implements ProjectType {
  constructor() {}
  versionCommands() {
    return { go: "version" };
  }
  async build(folder: string) {
    const buildCommands: string[] = [];
    buildCommands.push(
      `CGO_ENABLED=0 go build -o app -ldflags="-extldflags=-static"`
    );
    return buildCommands;
  }
  async runCommand(folder: string) {
    return `./app`;
  }
  async update(folder: string): Promise<string[]> {
    throw "TODO";
  }
  async upgrade(folder: string): Promise<string[]> {
    throw "TODO";
  }
}
