import yargs from "yargs";
import { hideBin } from "yargs/helpers";

type Path = string;

interface TArgs {
  directory: string;
  all?: boolean;
  individual?: boolean;
  file_path?: string;
}

/**
 *
 * Gets all the file paths in a directory.
 * @param dir The directory to search.
 * @returns An array of file paths.
 *
 * */
function getAllFiles(dir: Path): Path[] {
  return [];
}

/**
 * Creates an empty report file in the same directory as the source file.
 * @param sourceFile
 * @returns The path to the newly created report file.
 */
function createEmptyReport(sourceFile: Path): Path {
  return "";
}

/**
 * Writes the report to a file.
 * @param report The report to write.
 * @param reportFile The file to write the report to.
 */
function writeReport(report: string, reportFile: Path): void {}

/*
 *
 * Generates a report of the number of files in a directory.
 * @param sourceFile The source file to generate a report for.
 * @returns void
 *
 */
function generateReport(sourceFile: Path): void {}

async function initArgs(): Promise<TArgs> {
  const argv = await yargs(hideBin(process.argv))
    .option("directory", {
      type: "string",
      demandOption: true,
      describe: "The directory to process",
    })
    .option("all", {
      type: "boolean",
      default: false,
      describe: "Process all files",
    })
    .option("individual", {
      type: "boolean",
      default: false,
      describe: "Generate individual reports",
    })
    .option("file_path", {
      type: "string",
      default: "",
      describe: "The path of a specific file to process",
    }).argv;

  return {
    directory: argv.directory as string,
    all: argv.all as boolean,
    individual: argv.individual as boolean,
    file_path: argv.file_path as string,
  };
}

/**
 *
 * @param directory The directory to process.
 * @returns void
 */
async function run(): void {
  const args = await initArgs();

  const { directory } = args;

  if (!args.directory) {
    console.log("tiratana: no directory provided. Exiting.");
    process.exit(1);
  }
  const files = getAllFiles(args.directory);

  files.forEach((sourceFile) => {
    try {
      generateReport(sourceFile);
      const reportFile = createEmptyReport(sourceFile);
      const report = `tiratana: found ${files.length} files.`;
      writeReport(report, reportFile);
    } catch (err) {
      console.error(`tiratana: failed to process ${sourceFile}`, err);
    }
  });

  console.log(`tiratana: processed ${files.length} files in ${directory}.`);
}
