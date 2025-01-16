import { ExecOptions, spawn } from "child_process";
import { detectProjectType, ProjectTypes } from "./index.js";

function spawnPromise(str: string) {
  return new Promise<void>((resolve, reject) => {
    const [cmd, ...args] = str.split(" ");
    const options: ExecOptions = {
      cwd: ".",
      shell: "sh",
    };
    const ls = spawn(cmd, args, options);
    ls.stdout.on("data", (data: Buffer | string) => {
      process.stdout.write(data.toString());
    });
    ls.stderr.on("data", (data: Buffer | string) => {
      process.stderr.write(data.toString());
    });
    ls.on("close", (code) => {
      if (code === 0) resolve();
      else reject();
    });
  });
}

(async () => {
  try {
    const pt = await detectProjectType(".");
    const commands = await ProjectTypes[pt].upgrade(".");
    for (let i = 0; i < commands.length; i++) {
      const x = commands[i];
      await spawnPromise(x);
    }
  } catch (e) {}
})();
