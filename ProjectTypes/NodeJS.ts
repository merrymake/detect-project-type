import { existsSync } from "fs";
import { readFile, stat } from "fs/promises";
import { ProjectType } from "../ProjectType.js";
import stripJsonComments from "strip-json-comments";

export type package_json = {
  main?: string;
  scripts?: { start?: string; install?: string };
  dependencies?: { [key: string]: string };
  devDependencies?: { [key: string]: string };
};
export const NPM = `NPM_CONFIG_UPDATE_NOTIFIER=false npm_config_loglevel=error npm --no-fund `;
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
    if (!existsSync(`${folder}/package-lock.json`)) {
      buildCommands.push(NPM + "install");
    } else if (
      !existsSync(`${folder}/node_modules`) ||
      (await stat(`${folder}/node_modules`)).mtimeMs <=
        (await stat(`${folder}/package-lock.json`)).mtimeMs
    )
      buildCommands.push(NPM + "ci");
    if (this.typescript === true) buildCommands.push("tsc");
    let pkg: package_json = JSON.parse(
      await readFile(`${folder}/package.json`, "utf-8")
    );
    let hasInstallScript = pkg.scripts?.install !== undefined;
    if (hasInstallScript) buildCommands.push(NPM + "run install");
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
    const pkg: package_json = JSON.parse(
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
  private getDependencies(
    deps: { [library: string]: string } | undefined,
    updateMajor: boolean
  ) {
    if (deps === undefined) return [];
    return Object.entries(deps).flatMap((x) => {
      if (x[1] === "latest") return [x[0] + "@latest"];
      const parts = x[1].match(/(\d+)\.\d+\.\d+/);
      if (parts === null) {
        console.log(`Skipping '${x[0]}: ${x[1]}' `);
        return [];
      }
      return [x[0] + "@" + (updateMajor ? "latest" : parts[1])];
    });
  }
  private async reinstallDependencies(
    folder: string,
    updateMajor: boolean
  ): Promise<string[]> {
    const pkg: package_json = JSON.parse(
      await readFile(`${folder}/package.json`, "utf-8")
    );
    const commands: string[] = [];
    {
      const deps = this.getDependencies(pkg.dependencies, updateMajor);
      if (deps.length > 0)
        commands.push(
          `echo "Updating ${deps.length} production dependencies..."`,
          `${NPM} install --silent --save-exact ${deps.join(" ")}`
        );
    }
    {
      const devDeps = this.getDependencies(pkg.devDependencies, updateMajor);
      if (devDeps.length > 0)
        commands.push(
          `echo "Updating ${devDeps.length} development dependencies..."`,
          `${NPM} install --silent --save-dev --save-exact ${devDeps.join(" ")}`
        );
    }
    return commands;
  }
  async update(folder: string): Promise<string[]> {
    const result = await this.reinstallDependencies(folder, false);
    result.push(
      `${NPM} outdated || echo "Some dependencies are still outdated because they probably contain breaking changes. To remedy these use 'mm upgrade'"`
    );
    return result;
  }
  upgrade(folder: string): Promise<string[]> {
    return this.reinstallDependencies(folder, true);
  }
}
