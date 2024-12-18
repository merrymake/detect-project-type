import { readdir } from "fs/promises";
import { ProjectType } from "../ProjectType.js";

export class CSharp implements ProjectType {
  constructor() {}
  versionCommands() {
    return { dotnet: "--version" };
  }
  async build(folder: string) {
    const buildCommands: string[] = [];
    buildCommands.push(
      `dotnet build --nologo -v q --property WarningLevel=0 /clp:ErrorsOnly`
    );
    return buildCommands;
  }
  async runCommand(folder: string) {
    const Debug_or_Release = (await readdir(`${folder}/bin`))[0];
    const arch = (await readdir(`${folder}/bin/${Debug_or_Release}`))[0];
    const executable = (
      await readdir(`${folder}/bin/${Debug_or_Release}/${arch}`)
    ).find((x) => !x.includes(".") || x.endsWith(".exe"));
    return `./bin/${Debug_or_Release}/${arch}/${executable}`;
  }
}
