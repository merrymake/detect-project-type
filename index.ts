import fs from "fs";
export type ProjectType =
  | "docker"
  | "csharp"
  | "nodejs"
  | "typescript"
  | "gradle"
  | "maven"
  | "python"
  | "php"
  | "ruby"
  | "go"
  | "scala"
  | "clojure"
  | "rust";
export function detectProjectType(folder: string): ProjectType {
  let files = fs.readdirSync(folder);
  if (files.includes(`dockerfile`)) return "docker";
  if (files.includes(`tsconfig.json`)) return "typescript";
  if (files.includes(`package.json`)) return "nodejs";
  if (
    files.includes(`gradlew`) ||
    files.includes(`build.gradle`) ||
    files.includes(`settings.gradle`)
  )
    return "gradle";
  if (files.includes(`pom.xml`)) return "maven";
  if (
    files.includes(`requirements.txt`) ||
    files.includes(`setup.py`) ||
    files.includes(`Pipfile`) ||
    files.includes(`pyproject.toml`)
  )
    return "python";
  if (files.includes(`composer.json`) || files.includes(`index.php`))
    return "php";
  if (files.includes(`Gemfile`)) return "ruby";
  if (files.includes(`go.mod`)) return "go";
  if (files.includes(`project.clj`)) return "clojure";
  if (files.includes(`Cargo.toml`)) return "rust";
  if (files.some((x) => x.endsWith(`.csproj`))) return "csharp";
  // if (files.includes(`*.stb`)) return "scala";
  throw `Unknown project type in ${folder}`;
}

function nodeJsRunCommand(folder: string) {
  let pkg: { main?: string; scripts?: { start?: string } } = JSON.parse(
    "" + fs.readFileSync(`${folder}/package.json`)
  );
  let cmd =
    pkg.scripts?.start ||
    (fs.existsSync(`${folder}/server.js`) && `node server.js`) ||
    (fs.existsSync(`${folder}/app.js`) && `node app.js`) ||
    (pkg.main && `node ${pkg.main}`);
  if (cmd === undefined)
    throw `Missing scripts.start in: ${folder}/package.json`;
  return cmd;
}

function gradleRunCommand(folder: string) {
  let installDir: string;
  if (fs.existsSync(`${folder}/build/install`)) installDir = `/build/install`;
  else if (fs.existsSync(`${folder}/app/build/install`))
    installDir = `/app/build/install`;
  else throw `Could not locate build/install folder`;
  let gradleProjectName = fs.readdirSync(folder + installDir)[0];
  if (gradleProjectName === undefined)
    throw `Missing executable: ${folder}${installDir}`;
  return `.${installDir}/${gradleProjectName}/bin/${gradleProjectName}`;
}

function golangRunCommand(folder: string) {
  return `./app`;
}

function csharpRunCommand(folder: string) {
  let Debug_or_Release = fs.readdirSync(`${folder}/bin`)[0];
  let arch = fs.readdirSync(`${folder}/bin/${Debug_or_Release}`)[0];
  let executable = fs
    .readdirSync(`${folder}/bin/${Debug_or_Release}/${arch}`)
    .find((x) => !x.includes(".") || x.endsWith(".exe"));
  return `./bin/${Debug_or_Release}/${arch}/${executable}`;
}

function rustRunCommand(folder: string) {
  if (fs.existsSync(`${folder}/target/release/app`))
    return `./target/release/app`;
  if (fs.existsSync(`${folder}/target/release/app.exe`))
    return `./target/release/app.exe`;
  throw `Missing executable: /target/release/app`;
}

function pythonRunCommand(folder: string) {
  let appExists = fs.existsSync(`${folder}/app.py`);
  let mainExists = fs.existsSync(`${folder}/main.py`);
  let file: string;
  if (appExists && mainExists)
    throw `Cannot have both 'app.py' and 'main.py' in the root folder`;
  else if (appExists) file = `app.py`;
  else if (mainExists) file = `main.py`;
  else throw `Missing 'app.py'`;
  if (fs.existsSync(`${folder}/merrymake-env/bin`))
    return `PATH="$(pwd)/merrymake-env/bin:$PATH" python3 ${file}`;
  else if (fs.existsSync(`${folder}/merrymake-env/Scripts`))
    return `PATH="$(pwd)/merrymake-env/Scripts:$PATH" python3 ${file}`;
  throw `Missing virtual environment: /merrymake-env`;
}

export const RUN_COMMAND: {
  [projectType in ProjectType]: (folder: string) => string;
} = {
  docker: () => {
    throw "Custom dockerfiles are not supported";
  },
  nodejs: nodeJsRunCommand,
  typescript: nodeJsRunCommand,
  gradle: gradleRunCommand,
  maven: () => {
    throw "Maven support is coming soon";
  },
  python: pythonRunCommand,
  php: () => {
    throw "Php support is coming soon";
  },
  scala: () => {
    throw "Scala support is coming soon";
  },
  clojure: () => {
    throw "Clojure support is coming soon";
  },
  ruby: () => {
    throw "Ruby support is coming soon";
  },
  csharp: csharpRunCommand,
  rust: rustRunCommand,
  go: golangRunCommand,
};

function generateNewFileName(folder: string) {
  let result: string;
  do {
    result = "f" + Math.random();
  } while (fs.existsSync(`${folder}/${result}`));
  return result;
}

function nodeJsBuild(typescript: boolean) {
  return (folder: string) => {
    let buildCommands: string[] = [];
    buildCommands.push(
      "NPM_CONFIG_UPDATE_NOTIFIER=false npm_config_loglevel=error npm --no-fund ci"
    );
    if (typescript) buildCommands.push("tsc");
    let pkg: { scripts?: { install?: string } } = JSON.parse(
      "" + fs.readFileSync(`${folder}/package.json`)
    );
    let hasInstallScript = pkg.scripts?.install !== undefined;
    if (hasInstallScript)
      buildCommands.push(
        "NPM_CONFIG_UPDATE_NOTIFIER=false npm_config_loglevel=error npm run install"
      );
    return buildCommands;
  };
}

function gradleBuild(folder: string) {
  let buildCommands: string[] = [];
  buildCommands.push(`./gradlew install`);
  return buildCommands;
}

function golangBuild(folder: string) {
  let buildCommands: string[] = [];
  buildCommands.push(
    `CGO_ENABLED=0 go build -o app -ldflags="-extldflags=-static"`
  );
  return buildCommands;
}

function rustBuild(folder: string) {
  let buildCommands: string[] = [];
  buildCommands.push(`cargo build --release`);
  return buildCommands;
}

function csharpBuild(folder: string) {
  let buildCommands: string[] = [];
  buildCommands.push(
    `dotnet build --nologo -v q --property WarningLevel=0 /clp:ErrorsOnly`
  );
  return buildCommands;
}

function pythonBuild(folder: string) {
  let buildCommands: string[] = [];
  buildCommands.push(
    `python3 -m venv merrymake-env && . merrymake-env/**/activate && pip install -r requirements.txt`
  );
  return buildCommands;
}

export const BUILD_SCRIPT_MAKERS: {
  [projectType in ProjectType]: (folder: string) => string[];
} = {
  docker: () => {
    throw "Custom dockerfiles are not supported";
  },
  nodejs: nodeJsBuild(false),
  typescript: nodeJsBuild(true),
  gradle: gradleBuild,
  maven: () => {
    throw "Maven support is coming soon";
  },
  python: pythonBuild,
  php: () => {
    throw "Php support is coming soon";
  },
  scala: () => {
    throw "Scala support is coming soon";
  },
  clojure: () => {
    throw "Clojure support is coming soon";
  },
  ruby: () => {
    throw "Ruby support is coming soon";
  },
  csharp: csharpBuild,
  rust: rustBuild,
  go: golangBuild,
};

export function writeBuildScript(ptBuilder: (folder: string) => string[]) {
  return (folder: string) => {
    let cmds = ptBuilder(folder);
    let fileName = generateNewFileName(folder);
    fs.writeFileSync(`${folder}/${fileName}`, cmds.join("\n"));
    return fileName;
  };
}

export const VERSION_CMD: {
  [projectType in ProjectType]: { [tool: string]: string };
} = {
  docker: { docker: "--version" },
  nodejs: { npm: "--version", node: "--version" },
  typescript: { tsc: "--version", npm: "--version", node: "--version" },
  gradle: { javac: "--version" },
  maven: { javac: "--version" },
  python: { python3: "--version", pip: "--version" },
  php: { php: "--version" },
  scala: { "scala-cli": "version" },
  clojure: {},
  ruby: { ruby: "--version" },
  csharp: { dotnet: "--version" },
  rust: { cargo: "--version" },
  go: { go: "version" },
};
