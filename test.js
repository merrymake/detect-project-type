import { spawn } from "child_process";
import { detectProjectType, ProjectTypes } from "./index.js";
function spawnPromise(str) {
    return new Promise((resolve, reject) => {
        const [cmd, ...args] = str.split(" ");
        const options = {
            cwd: ".",
            shell: "sh",
        };
        const ls = spawn(cmd, args, options);
        ls.stdout.on("data", (data) => {
            process.stdout.write(data.toString());
        });
        ls.stderr.on("data", (data) => {
            process.stderr.write(data.toString());
        });
        ls.on("close", (code) => {
            if (code === 0)
                resolve();
            else
                reject();
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
    }
    catch (e) { }
})();
