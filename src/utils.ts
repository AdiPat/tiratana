import fs from "fs";
import path from "path";
import { IGNORE_DIRECTORIES, IGNORE_EXTENSIONS } from "./constants";
import { TArgs, Path } from "./types";

/**
 * Checks if a file should be ignored.
 * @param filePath File path to check if it should be ignored
 * @returns true if the file should be ignored
 */
const shouldIgnoreFileByExtension = (filePath: Path, ignoreExtensions: string[]): boolean => {
  let shouldIgnore = false;

  ignoreExtensions.forEach((ext) => {
    if (filePath.endsWith(ext)) {
      shouldIgnore = true;
    }

    // for .report.txt files, we should also ignore files that contain the extension
    if (filePath.includes(ext)) {
      shouldIgnore = true;
    }
  });

  return shouldIgnore;
};

/**
 * Splits text into chunks of a specified size
 * @param text Text to split
 * @param chunkSizeChars character size of chunk
 * @returns string[] array of chunks
 */
const splitTextIntoChunks = (
  text: string,
  chunkSizeChars: number
): string[] => {
  const chunks = [];
  let i = 0;

  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSizeChars));
    i += chunkSizeChars;
  }

  return chunks;
};

/**
 * Checks if file exists in a directory
 * @param dir directory to check if file exists
 * @param fileName filename to check
 * @returns true if file exists in directory
 */
const fileExistsInDirectory = (dir: string, fileName: string): boolean => {
  const filePath = path.join(dir, fileName);
  return fs.existsSync(filePath);
};

/**
 * Removes all files that should be ignored.
 * @param filePaths File paths to check
 * @returns Path array of file paths that are not ignored
 */
const filterIgnoredFiles = (filePaths: Path[], ignoreDirectories: string[], ignoreExtensions: string[]): Path[] => {
  if (!filePaths) {
    return [];
  }

  return filePaths.filter((filePath) => {
    const fileExtension = path.extname(filePath);
    const fileDirectory = path.dirname(filePath);

    const ignoreByExtension = shouldIgnoreFileByExtension(filePath, ignoreExtensions);
    const ignoreByDirectory = ignoreDirectories.some((dir) =>
      filePath.startsWith(dir)
    );

    // If the file should be ignored by extension or directory, return false to exclude it from the filtered list
    return ignoreByDirectory || ignoreByExtension ? false : true;
  });
};

/**
 *
 * Validate command-line arguments
 * @param args The arguments to validate.
 * @returns void
 *
 */
function validateArgs(args: TArgs): void {
  if (args.clear) {
    if (!(args.directory && args.directory != "")) {
      console.error("tiratana: no directory provided. Exiting.");
      process.exit(1);
    }

    if (args.all || args.file_path || args.individual) {
      console.log(
        "tiratana: clear cannot be passed with other arguments except directory. Exiting.  "
      );
      process.exit(1);
    }
  }

  // if clear is passed alone, then it's a valid combination of arguments
  if (args.clear && args.directory && args.directory != "") {
    return;
  }

  if (args.all && !args.directory) {
    console.log("tiratana: no directory provided. Exiting.");
    process.exit(1);
  }

  if (!args.directory) {
    if (!(args.individual && args.file_path)) {
      console.log("tiratana: no directory provided. Exiting.");
      process.exit(1);
    }
  }

  if (args.all && args.individual) {
    console.log(
      "tiratana: cannot process all and individual files at the same time. Exiting."
    );
    process.exit(1);
  }

  if (args.file_path && !args.individual) {
    console.log(
      "tiratana: file_path provided without individual flag. Exiting."
    );
    process.exit(1);
  }
}

function parseGitignore(gitignorePath: string): { directories: string[], extensions: string[] } {
  try {
    const ignoreContent = fs.readFileSync(gitignorePath, "utf8");
    const ignoreLines = ignoreContent.split("\n");

    const directories: string[] = [];
    const extensions: string[] = [];

    for(const line of ignoreLines){
      const trimmedLine = line.trim();

      if(trimmedLine === "" || trimmedLine.startsWith("#")){
        // Skip empty lines and comments
        continue;
      }
      if(trimmedLine.startsWith("/")){
        // Ignore root-level files or directories
        if(trimmedLine.endsWith("/")){
          directories.push(trimmedLine.slice(1, -1)); //Directory pattern
        } else{
          extensions.push(path.extname(trimmedLine.slice(1))); //File extension pattern
        }
      } else{
        if(trimmedLine.endsWith("/")){
          directories.push(trimmedLine.slice(0, -1));
        } else{
          extensions.push(path.extname(trimmedLine));
        }
      }
    }

    return { directories, extensions };
  } catch (err) {
    console.error("Failed to read or parse .gitignore file", err);
    return {directories: [], extensions: []}; //Return empty arrays in case of error
  }

}

export {
  shouldIgnoreFileByExtension,
  splitTextIntoChunks,
  fileExistsInDirectory,
  filterIgnoredFiles,
  validateArgs,
  parseGitignore, // Exporting the new function
};
