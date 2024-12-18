export class Go {
    constructor() { }
    versionCommands() {
        return { go: "version" };
    }
    async build(folder) {
        const buildCommands = [];
        buildCommands.push(`CGO_ENABLED=0 go build -o app -ldflags="-extldflags=-static"`);
        return buildCommands;
    }
    async runCommand(folder) {
        return `./app`;
    }
}
