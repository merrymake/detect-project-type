import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { ProjectType } from "./ProjectType";

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
}
