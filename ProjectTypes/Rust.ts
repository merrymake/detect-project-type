import { existsSync } from "fs";
import { ProjectType } from "../ProjectType.js";

export class Rust implements ProjectType {
  constructor() {}
  versionCommands() {
    return { cargo: "--version" };
  }
  async build(folder: string) {
    const buildCommands: string[] = [];
    buildCommands.push(`cargo build --release`);
    return buildCommands;
  }
  async runCommand(folder: string) {
    if (existsSync(`${folder}/target/release/app`))
      return `./target/release/app`;
    if (existsSync(`${folder}/target/release/app.exe`))
      return `./target/release/app.exe`;
    throw `Missing executable: /target/release/app`;
  }
  async update(folder: string): Promise<string[]> {
    throw "TODO";
  }
  async upgrade(folder: string): Promise<string[]> {
    throw "TODO";
  }
}
