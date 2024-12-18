export interface ProjectType {
  versionCommands(): { [tool: string]: string };
  build(folder: string): Promise<string[]>;
  runCommand(folder: string): Promise<string>;
}
