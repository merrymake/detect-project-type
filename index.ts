import { existsSync } from "fs";
import { readdir, writeFile } from "fs/promises";
import { CSharp } from "./ProjectTypes/CSharp.js";
import { Go } from "./ProjectTypes/Go.js";
import { Gradle } from "./ProjectTypes/Gradle.js";
import { NodeJS } from "./ProjectTypes/NodeJS.js";
import { ProjectType } from "./ProjectType.js";
import { Python } from "./ProjectTypes/Python.js";
import { Rust } from "./ProjectTypes/Rust.js";
import { valueType } from "@merrymake/utils";

export const ProjectTypes = valueType<ProjectType>()({
  nodejs: new NodeJS(false),
  typescript: new NodeJS(true),
  gradle: new Gradle(),
  go: new Go(),
  rust: new Rust(),
  csharp: new CSharp(),
  python: new Python(),
});

export async function detectProjectType(
  folder: string
): Promise<keyof typeof ProjectTypes> {
  let files = await readdir(folder);
  if (files.includes(`dockerfile`))
    throw "Custom dockerfiles are not supported";
  if (files.includes(`tsconfig.json`)) return "typescript";
  if (files.includes(`package.json`)) return "nodejs";
  if (
    files.includes(`gradlew`) ||
    files.includes(`build.gradle`) ||
    files.includes(`settings.gradle`)
  )
    return "gradle";
  if (files.includes(`pom.xml`)) throw "Maven support is coming soon";
  if (
    files.includes(`requirements.txt`) ||
    files.includes(`setup.py`) ||
    files.includes(`Pipfile`) ||
    files.includes(`pyproject.toml`) ||
    files.includes(`app.py`) ||
    files.includes(`main.py`)
  )
    return "python";
  if (files.includes(`composer.json`) || files.includes(`index.php`))
    throw "Php support is coming soon";
  if (files.includes(`Gemfile`)) throw "Ruby support is coming soon";
  if (files.includes(`go.mod`)) return "go";
  if (files.includes(`project.clj`)) throw "Clojure support is coming soon";
  if (files.includes(`Cargo.toml`)) return "rust";
  if (files.some((x) => x.endsWith(`.csproj`))) return "csharp";
  if (files.includes(`*.stb`)) throw "Scala support is coming soon";
  throw `Unknown project type in ${folder}`;
}

function generateNewFileName(folder: string) {
  let result: string;
  do {
    result = "f" + Math.random();
  } while (existsSync(`${folder}/${result}`));
  return result;
}

export function writeBuildScript(pt: ProjectType) {
  return async (folder: string) => {
    const cmds = await pt.build(folder);
    const fileName = generateNewFileName(folder);
    await writeFile(`${folder}/${fileName}`, cmds.join("\n"));
    return fileName;
  };
}
