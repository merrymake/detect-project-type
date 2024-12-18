import { existsSync } from "fs";
import { readdir } from "fs/promises";
import { ProjectType } from "./ProjectType";

export class Gradle implements ProjectType {
  constructor() {}
  versionCommands() {
    return { javac: "--version" };
  }
  async build(folder: string) {
    const buildCommands: string[] = [];
    buildCommands.push(`./gradlew install`);
    return buildCommands;
  }
  async runCommand(folder: string) {
    const installDir = (() => {
      if (existsSync(`${folder}/build/install`)) return `/build/install`;
      else if (existsSync(`${folder}/app/build/install`))
        return `/app/build/install`;
      else throw `Could not locate build/install folder`;
    })();
    const gradleProjectName = (await readdir(folder + installDir))[0];
    if (gradleProjectName === undefined)
      throw `Missing executable: ${folder}${installDir}`;
    return `.${installDir}/${gradleProjectName}/bin/${gradleProjectName}`;
  }
}
