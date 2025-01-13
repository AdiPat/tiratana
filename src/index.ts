#!/usr/bin/env node

/**
 *
 * The 'runner' function for the Tiratana CLI.
 *
 * @author Aditya Patange (AdiPat)
 * @description Tiratana CLI runner program.
 * @file index.ts
 * @license MIT
 * @module tiratana
 * ⚡️ "CLI is to terminal, as GUI is to desktop." — AdiPat
 *
 */

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { generateReport, standardizeReport } from "./report-generator";
import { Path, TiratanaArgs } from "./types";
import {
  generateFunFileName,
  prettyLogArgs,
  validateArgs,
  printBanner,
  stripMarkdown,
} from "./utils";
import { Loader } from "./loader";
import { initConfig, promptUserForEnvVariables } from "./config";
import fs from "fs/promises";
import chalk from "chalk";

/**
 * Parses the command-line arguments and returns them in a recognizable format.
 * @returns The parsed command-line arguments.
 */
async function initArgs(): Promise<TiratanaArgs> {
  const argv = await yargs(hideBin(process.argv))
    .option("directory", {
      alias: "d",
      type: "string",
      demandOption: false,
      describe: "The directory to process",
    })
    .option("verbose", {
      alias: "v",
      type: "boolean",
      default: false,
      describe: "Print verbose logs",
    })
    .option("outputFile", {
      alias: "o",
      type: "string",
      demandOption: false,
      describe: "The output file to write the report to",
    })
    .option("performanceStats", {
      alias: "p",
      type: "boolean",
      default: false,
      describe: "Print performance statistics",
    })
    .option("writePreliminaryAnalysis", {
      alias: "z",
      type: "boolean",
      default: false,
      describe: "Write preliminary analysis to a file",
    })
    .option("standardize", {
      alias: "s",
      type: "boolean",
      default: false,
      describe: "Standardize the report",
    })
    .option("standardizationFile", {
      alias: "f",
      type: "string",
      demandOption: false,
      describe: "The file to use for standardization",
    })
    .help()
    .parse();

  const args: TiratanaArgs = {
    directory: argv.directory as string,
    verbose: argv.verbose as boolean,
    outputFile: argv.outputFile as string,
    performanceStats: argv.performanceStats as boolean,
    writePreliminaryAnalysis: argv.writePreliminaryAnalysis as boolean,
    standardizationFile: argv.standardizationFile as string,
    standardize: argv.standardize as boolean,
  };

  return args;
}

/**
 * Clears the terminal screen.
 */
async function clearScreen() {
  process.stdout.write("\x1Bc");
}

async function runStandardization(args: TiratanaArgs) {}

/**
 * Runs the Tiratana program.
 * @param directory The directory to process.
 * @returns void
 */
async function run(): Promise<void> {
  await clearScreen();
  console.log("Welcome to Tiratana!");
  await printBanner();

  const args = await initArgs();
  const verbose = args.verbose;

  if (args.directory) {
    try {
      await fs.access(args.directory);
    } catch (error: any) {
      console.error(
        chalk.redBright(
          `Error: Directory '${args.directory}' does not exist or is inaccessible.\n`
        )
      );
      process.exit(1);
    }
  }

  if (args.standardize) {
    if (!args.standardizationFile) {
      console.error(
        chalk.redBright(
          "Error: Standardization file not provided. Please provide a standardization file to proceed."
        )
      );
      process.exit(1);
    }

    let outputFile = args.outputFile;

    if (!outputFile) {
      outputFile = "standardized_report_" + generateFunFileName("md");
      console.warn(
        chalk.yellow(`No output file specified. Using default: ${outputFile}.`)
      );
    }

    if (verbose) {
      console.log(
        chalk.yellow(
          `🔧 Standardization: Running standardization on the report ${args.standardizationFile}`
        )
      );
    }

    const reportContent = await fs
      .readFile(args.standardizationFile, "utf8")
      .catch((error) => {
        console.error(
          chalk.redBright("Error reading standardization file: ", error.message)
        );
        process.exit(1);
      });

    const standardizedReport = await standardizeReport(reportContent);

    await fs
      .writeFile(outputFile, standardizedReport.standardizedReport, "utf8")
      .then(() => {
        console.log(
          chalk.green(`🎉 Standardized report written to ${outputFile}!`)
        );
      })
      .catch((err) => {
        console.error(
          chalk.redBright("Error writing standardized report: ", err.message)
        );
      });

    if (args.performanceStats) {
      console.log(chalk.yellowBright("🔥 Performance Stats:"));
      console.table(standardizedReport.performanceStats);
    }

    return;
  }

  if (verbose) {
    console.log(
      chalk.yellowBright(
        "🔊 Verbose Mode: Enabled!\nPrinting verbose logs for debugging."
      )
    );
  }

  const writePreliminaryAnalysis = Boolean(args.writePreliminaryAnalysis);

  if (writePreliminaryAnalysis) {
    console.log(
      chalk.yellowBright(
        "📝 Preliminary Analysis: Enabled!\nWriting preliminary analysis to file."
      )
    );
  }

  const performanceStats = Boolean(args.performanceStats);

  if (performanceStats) {
    console.log(
      chalk.yellowBright(
        "🔥 Performance Stats: Enabled!\nTracking system potential in real-time."
      )
    );
  }

  const outputFile = args.outputFile ?? "report_" + generateFunFileName("md");

  if (!args.outputFile) {
    console.warn(
      chalk.yellow(`No output file specified. Using default: ${outputFile}`)
    );
  }

  await initConfig(verbose);

  if (verbose) {
    await Loader.load(
      () => {
        prettyLogArgs(args);
      },
      2000,
      "Processing args..."
    );
  }

  validateArgs(args);

  const report = await generateReport(
    args.directory,
    verbose,
    performanceStats
  );

  if (performanceStats) {
    console.log(chalk.yellowBright("🔥 Performance Stats:"));
    console.table(report.performanceTable);
  }

  try {
    if (writePreliminaryAnalysis) {
      const preliminaryAnalysisFile = "preliminary_analysis_" + outputFile;

      if (verbose) {
        console.log(
          chalk.yellow(
            `👉🏽 Writing preliminary analysis to ${preliminaryAnalysisFile}...`
          )
        );
      }
      await fs.writeFile(
        preliminaryAnalysisFile,
        report.preliminaryAnalysis,
        "utf8"
      );

      if (verbose) {
        console.log(
          chalk.green(
            `🎉 Preliminary analysis written to ${preliminaryAnalysisFile}!`
          )
        );
      }
    }

    const cleanedReport = stripMarkdown(report.report, verbose);
    await fs.writeFile(outputFile, cleanedReport, "utf8");
    console.log(chalk.green(`🎉 Report written to ${outputFile}!`));
  } catch (error) {
    console.error(chalk.redBright("Error writing report to file: ", error));
  }
}

// Run the program if called directly from the command line
if (require.main === module) {
  run();
}

export { generateReport, Path, TiratanaArgs };
