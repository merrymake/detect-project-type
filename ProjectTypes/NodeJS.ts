import { existsSync } from "fs";
import { readFile, stat } from "fs/promises";
import { ProjectType } from "../ProjectType.js";
import stripJsonComments from "strip-json-comments";

export class NodeJS implements ProjectType {
  constructor(private typescript: boolean) {}
  versionCommands() {
    return {
      npm: "--version",
      node: "--version",
      tsc: this.typescript === true ? "--version" : undefined,
    };
  }
  async build(folder: string) {
    const buildCommands: string[] = [];
    if (
      !existsSync(`${folder}/node_modules`) ||
      (await stat(`${folder}/node_modules`)).mtimeMs <=
        (await stat(`${folder}/package.json`)).mtimeMs
    )
      buildCommands.push(
        "NPM_CONFIG_UPDATE_NOTIFIER=false npm_config_loglevel=error npm --no-fund ci"
      );
    if (this.typescript === true) buildCommands.push("tsc");
    let pkg: { scripts?: { install?: string } } = JSON.parse(
      await readFile(`${folder}/package.json`, "utf-8")
    );
    let hasInstallScript = pkg.scripts?.install !== undefined;
    if (hasInstallScript)
      buildCommands.push(
        "NPM_CONFIG_UPDATE_NOTIFIER=false npm_config_loglevel=error npm run install"
      );
    buildCommands.push(
      "NPM_CONFIG_UPDATE_NOTIFIER=false npm_config_loglevel=error npm prune --omit=dev"
    );
    return buildCommands;
  }
  async runCommand(folder: string) {
    const out =
      this.typescript === true
        ? JSON.parse(
            stripJsonComments(
              await readFile(`${folder}/tsconfig.json`, "utf-8")
            )
          )?.compilerOptions?.outDir || ""
        : "";
    const pkg: { main?: string; scripts?: { start?: string } } = JSON.parse(
      await readFile(`${folder}/package.json`, "utf-8")
    );
    const cmd =
      (pkg.scripts?.start && `NODE_ENV=production ${pkg.scripts?.start}`) ||
      (existsSync(`${folder}/${out && out + "/"}server.js`) &&
        `NODE_ENV=production node ${out && out + "/"}server.js`) ||
      (existsSync(`${folder}/${out && out + "/"}app.js`) &&
        `NODE_ENV=production node ${out && out + "/"}app.js`) ||
      (pkg.main && `NODE_ENV=production node ${pkg.main}`);
    if (cmd === undefined)
      throw `Missing scripts.start in: ${folder}/package.json`;
    return cmd;
  }
}
