import { existsSync } from "fs";
import { stat } from "fs/promises";
export class Python {
    constructor() { }
    versionCommands() {
        return { python3: "--version", pip: "--version" };
    }
    async build(folder) {
        const buildCommands = [];
        if (!existsSync(`${folder}/merrymake-env`) ||
            (await stat(`${folder}/merrymake-env`)).mtimeMs <=
                (await stat(`${folder}/requirements.txt`)).mtimeMs)
            buildCommands.push(`python -m venv merrymake-env && . merrymake-env/**/activate && pip install -r requirements.txt`);
        return buildCommands;
    }
    async runCommand(folder) {
        const appExists = existsSync(`${folder}/app.py`);
        const mainExists = existsSync(`${folder}/main.py`);
        let file;
        if (appExists && mainExists)
            throw `Cannot have both 'app.py' and 'main.py' in the root folder`;
        else if (appExists)
            file = `app.py`;
        else if (mainExists)
            file = `main.py`;
        else
            throw `Missing 'app.py'`;
        if (existsSync(`${folder}/merrymake-env/bin`))
            return `PATH="$(pwd)/merrymake-env/bin:$PATH" python ${file}`;
        else if (existsSync(`${folder}/merrymake-env/Scripts`))
            return `PATH="$(pwd)/merrymake-env/Scripts:$PATH" python ${file}`;
        throw `Missing virtual environment: /merrymake-env`;
    }
    async update(folder) {
        throw "TODO";
    }
    async upgrade(folder) {
        throw "TODO";
    }
}
