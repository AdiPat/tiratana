import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import fs from "fs";
import path from "path";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import dotenv from "dotenv";

dotenv.config();

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

/**
 * Checks if a file should be ignored.
 * @param filePath File path to check if it should be ignored
 * @returns true if the file should be ignored
 */
const shouldIgnoreFileByExtension = (filePath: Path): boolean => {
  let shouldIgnore = false;

  IGNORE_EXTENSIONS.forEach((ext) => {
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
function fileExistsInDirectory(dir: string, fileName: string): boolean {
  const filePath = path.join(dir, fileName);
  return fs.existsSync(filePath);
}

/**
 * Removes all files that should be ignored.
 * @param filePaths File paths to check
 * @returns Path array of file paths that are not ignored
 */
const filterIgnoredFiles = (filePaths: Path[]): Path[] => {
  if (!filePaths) {
    return [];
  }

  return filePaths.filter((filePath) => {
    const fileExtension = path.extname(filePath);
    const fileDirectory = path.dirname(filePath);

    const ignoreByExtension = shouldIgnoreFileByExtension(filePath);
    const ignoreByDirectory = IGNORE_DIRECTORIES.some((dir) =>
      filePath.startsWith(dir)
    );

    // If the file should be ignored by extension or directory, return false to exclude it from the filtered list
    return ignoreByDirectory || ignoreByExtension ? false : true;
  });
};

/**
 *
 * Gets all the file paths in a directory (includes ignored files)
 * @param dir The directory to search.
 * @returns An array of file paths.
 *
 * */
function getAllFiles(dir: Path): Path[] | null {
  try {
    const dirents = fs.readdirSync(dir, { withFileTypes: true });
    let filePaths: Path[] = [];

    dirents.forEach((dirent) => {
      if (dirent.isDirectory()) {
        const files = getAllFiles(path.join(dir, dirent.name));

        if (!files) {
          console.error("failed to get all files in directory");
          return null;
        }

        filePaths = filePaths.concat(files);
      } else {
        filePaths.push(path.join(dir, dirent.name));
      }
    });

    return filePaths;
  } catch (err) {
    console.error("failed to get all files in directory", err);
    return null;
  }
}

/**
 *
 * Gets all valid files (doesn't include ignored files)
 * @param dir The directory to search.
 * @returns An array of file paths.
 *
 * */
function getAllValidFiles(dir: Path): Path[] | null {
  try {
    const allFiles = getAllFiles(dir);

    if (!allFiles) {
      throw new Error("failed to get all files in directory");
    }

    const filteredFiles = filterIgnoredFiles(allFiles);

    return filteredFiles;
  } catch (err) {
    console.error("failed to get all files in directory", err);
    return null;
  }
}

/**
 * Generates the report file path.
 * @param sourceFile
 * @returns The path to the report file for given source file.
 */
function getReportFilePath(sourceFile: Path): Path | null {
  try {
    const dir = path.dirname(sourceFile);
    const baseName = path.basename(sourceFile, path.extname(sourceFile));
    const reportFile = path.join(dir, `${baseName}.report.txt`);
    return reportFile;
  } catch (err) {
    console.error("tiratana: failed to create an empty report. ", err);
    return null;
  }
}

/**
 * Creates an empty report file in the same directory as the source file.
 * @param sourceFile
 * @returns The path to the newly created report file.
 */
function createEmptyReport(sourceFile: Path): Path | null {
  try {
    const reportFilePath = getReportFilePath(sourceFile);

    if (!reportFilePath) {
      throw new Error("failed to get report file path");
    }

    const report = "";
    writeReport(report, reportFilePath);
    return reportFilePath;
  } catch (err) {
    console.error("tiratana: failed to create an empty report. ", err);
    return null;
  }
}

/**
 * Writes the report to a file.
 * @param report The report to write.
 * @param reportFile The file to write the report to.
 */
function writeReport(report: string, reportFile: Path): void {
  try {
    // NOTE: although this is just an abstraction over one function call,
    // we want to have custom logic in here for future
    // things like templating and file formats, etc.
    if (!report) {
      console.error("tiratana: no report supplied. ");
      return;
    }

    fs.writeFileSync(reportFile, report);
  } catch (err) {
    console.error("tiratana: failed to create an empty report. ", err);
    return;
  }
}

/*
 *
 * Generates a report of the number of files in a directory.
 * @param sourceFile The source file to generate a report for.
 * @returns void
 *
 */
async function generateReport(sourceFile: Path): Promise<string> {
  try {
    const content = fs.readFileSync(sourceFile, "utf8");
    console.log(
      `tiratana: found ${content.length} characters in ${sourceFile}`
    );

    const results = [];

    const chunks = splitTextIntoChunks(content, 1000);

    for (const chunk of chunks) {
      const result = await generateText({
        model: openai("gpt-4o"),
        maxTokens: 4096 - chunk.length,
        prompt: `If this is code written in a known programming language, explain each line of this file. \n" +
          If this is not a valid source file or you are unsure, just return "Not a valid code file.". \n\n" +
          File Content: ${chunk}`,
      });
      results.push(result.text);
    }

    return results.join("\n");
  } catch (err) {
    console.error("tiratana: failed to generate report", err);
    return "Failed to generate report.";
  }
}

async function initArgs(): Promise<TArgs> {
  const argv = await yargs(hideBin(process.argv))
    .option("directory", {
      alias: "d",
      type: "string",
      demandOption: false,
      describe: "The directory to process",
    })
    .option("all", {
      alias: "a",
      type: "boolean",
      default: false,
      describe: "Process all files",
    })
    .option("individual", {
      alias: "i",
      type: "boolean",
      default: false,
      describe: "Generate individual reports",
    })
    .option("file_path", {
      alias: "f",
      type: "string",
      default: "",
      describe: "The path of a specific file to process",
    })
    .option("clear", {
      alias: "c",
      type: "boolean",
      default: false,
      describe: "Clear all reports in the directory",
    })
    .parse();

  return {
    directory: argv.directory as string,
    all: argv.all as boolean,
    individual: argv.individual as boolean,
    file_path: argv.file_path as string,
    clear: argv.clear as boolean,
  };
}

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

/**
 * Deletes all existing report files.
 * @param directory The directory to clear reports from.
 * @returns number the count of reports cleared
 */
function clearReports(directory: Path): number {
  try {
    const files = getAllFiles(directory);

    if (!files) {
      throw new Error("failed to get all files in directory");
    }

    const reportFiles = files?.filter((file) => file.endsWith(".report.txt"));

    if (reportFiles.length == 0) {
      console.log(`tiratana: no report files found in ${directory}`);
      return 0;
    }

    reportFiles.forEach((file) => {
      if (file.endsWith(".report.txt")) {
        fs.unlinkSync(path.join(directory, file));
      }
    });

    return reportFiles?.length;
  } catch (err) {
    console.error("tiratana: failed to clear reports", err);
    return 0;
  }
}

/**
 *
 * @param directory The directory to process.
 * @returns void
 */
async function run(): Promise<void> {
  const args = await initArgs();

  validateArgs(args);

  if (args.clear) {
    console.log("tiratana: clearing reports");
    const clearedReports = clearReports(args.directory);
    console.log(`tiratana: cleared ${clearedReports} reports`);
  }

  if (args.file_path) {
    const report = await generateReport(args.file_path);
    const reportFilePath = getReportFilePath(args.file_path);

    if (reportFilePath) {
      writeReport(report, reportFilePath);
    }

    console.log(`tiratana: processed ${args.file_path}`);
    return;
  }

  if (args.all) {
    const files = getAllValidFiles(args.directory);

    if (!files) {
      console.log(
        `tiratana: failed to fetch files ${args.directory} (system error)`
      );
      return;
    }

    if (files.length == 0) {
      console.log(`tiratana: no files found in ${args.directory}`);
      return;
    }

    console.log(`tiratana: found ${files.length} files in ${args.directory}`);

    for (const sourceFile of files) {
      try {
        const report = await generateReport(sourceFile);
        const reportFilePath = getReportFilePath(sourceFile);

        if (reportFilePath) {
          writeReport(report, reportFilePath);
        }

        console.log(`tiratana: processed ${sourceFile}`);
      } catch (err) {
        console.error(`tiratana: failed to process ${sourceFile}`, err);
      }
    }

    console.log(
      `tiratana: processed ${files.length} files in ${args.directory}.`
    );
    return;
  }
}

run();

export { generateReport, writeReport, Path, TArgs };
