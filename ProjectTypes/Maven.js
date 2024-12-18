export class Maven {
    constructor() { }
    versionCommands() {
        return { javac: "--version" };
    }
    async build(folder) {
        const buildCommands = [];
        buildCommands.push(``);
        return buildCommands;
    }
    async runCommand(folder) {
        return ``;
    }
}
