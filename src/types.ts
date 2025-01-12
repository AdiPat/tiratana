interface TArgs {
  directory: string;
  all?: boolean;
  individual?: boolean;
  file_path?: string;
  clear?: boolean;
  verbose?: boolean;
}

type Path = string;

export { TArgs, Path };
