type Path = string;

const IGNORE_DIRECTORIES = [".git", "node_modules", "dist", "build"];
const IGNORE_EXTENSIONS = [".report.txt", ".json", ".yaml"];

interface TArgs {
  directory: string;
  all?: boolean;
  individual?: boolean;
  file_path?: string;
  clear?: boolean;
}

export { Path, TArgs, IGNORE_DIRECTORIES, IGNORE_EXTENSIONS };
