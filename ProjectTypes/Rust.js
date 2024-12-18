import { existsSync } from "fs";
export class Rust {
    constructor() { }
    versionCommands() {
        return { cargo: "--version" };
    }
    async build(folder) {
        const buildCommands = [];
        buildCommands.push(`cargo build --release`);
        return buildCommands;
    }
    async runCommand(folder) {
        if (existsSync(`${folder}/target/release/app`))
            return `./target/release/app`;
        if (existsSync(`${folder}/target/release/app.exe`))
            return `./target/release/app.exe`;
        throw `Missing executable: /target/release/app`;
    }
}
