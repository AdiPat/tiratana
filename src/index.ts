#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import {
  generateReport,
  getAllValidFiles,
  getReportFilePath,
  writeReport,
} from "./report-generator";
import { Path, TArgs } from "./types";
import { hr, prettyLogArgs, printHelp, validateArgs } from "./utils";
import { Loader } from "./loader";
import { initConfig } from "./config";

async function printBanner() {
  const bannerText = [
    hr(),
    "Tiratana 💎: Generate useful codebase reports easily!",
    hr(),
  ];

  for (const line of bannerText) {
    console.log(line);
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
    .option("verbose", {
      alias: "v",
      type: "boolean",
      default: false,
      describe: "Print verbose logs",
    })
    .help()
    .parse();

  const args: TArgs = {
    directory: argv.directory as string,
    all: argv.all as boolean,
    individual: argv.individual as boolean,
    file_path: argv.file_path as string,
    verbose: argv.verbose as boolean,
  };

  return args;
}

/**
 *
 * @param directory The directory to process.
 * @returns void
 */
async function run(): Promise<void> {
  await printBanner();

  const args = await initArgs();
  const verbose = args.verbose;

  await initConfig(verbose);

  if (args.verbose) {
    Loader.load(
      () => {
        prettyLogArgs(args);
      },
      2000,
      "Processing args..."
    );
  }

  validateArgs(args);

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
    let files: Path[] | null = [];

    try {
      files = getAllValidFiles(args.directory);

      if (!files || files.length == 0) {
        throw new Error("unexpected error: failed to fetch files.");
      }
    } catch (err) {
      console.error(
        `tiratana: failed to fetch files ${args.directory} (system error).`
      );
      return;
    }

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
