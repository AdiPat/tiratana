#!/usr/bin/env node
import "./config";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import {
  clearReports,
  generateReport,
  getAllValidFiles,
  getReportFilePath,
  writeReport,
} from "./report-generator";
import { Path, TArgs } from "./constants";
import { validateArgs } from "./utils";

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
    .help()
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
