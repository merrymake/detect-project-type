export class Maven {
    constructor() { }
    versionCommands() {
        return { "scala-cli": "version" };
    }
    async build(folder) {
        const buildCommands = [];
        buildCommands.push(``);
        return buildCommands;
    }
    async runCommand(folder) {
        return ``;
    }
    async update(folder) {
        throw "TODO";
    }
    async upgrade(folder) {
        throw "TODO";
    }
}
