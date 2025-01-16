export interface ProjectType {
  versionCommands(): { [tool: string]: string | undefined };
  build(folder: string): Promise<string[]>;
  runCommand(folder: string): Promise<string>;
  update(folder: string): Promise<string[]>;
  upgrade(folder: string): Promise<string[]>;
}
