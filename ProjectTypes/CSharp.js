import { readdir } from "fs/promises";
export class CSharp {
    constructor() { }
    versionCommands() {
        return { dotnet: "--version" };
    }
    async build(folder) {
        const buildCommands = [];
        buildCommands.push(`dotnet build --nologo -v q --property WarningLevel=0 /clp:ErrorsOnly`);
        return buildCommands;
    }
    async runCommand(folder) {
        const Debug_or_Release = (await readdir(`${folder}/bin`))[0];
        const arch = (await readdir(`${folder}/bin/${Debug_or_Release}`))[0];
        const executable = (await readdir(`${folder}/bin/${Debug_or_Release}/${arch}`)).find((x) => !x.includes(".") || x.endsWith(".exe"));
        return `./bin/${Debug_or_Release}/${arch}/${executable}`;
    }
}
