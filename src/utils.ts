/**
 *
 * Utility functions for the Tiratana CLI.
 * @author Aditya Patange (AdiPat)
 * @description Utility functions for the Tiratana CLI.
 * @file utils.ts
 * @license MIT
 * @module tiratana
 * ⚡️ "The best way to learn to code is to code." — Oen
 *
 */
import { randomUUID } from "crypto";
import { DEFAULT_CHUNK_OVERLAP_CHARS } from "./constants";
import { TiratanaArgs } from "./types";
import chalk from "chalk";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import fs from "fs/promises";

/**
 * Splits text into chunks of a specified size with optional overlap.
 * Useful for processing large strings in manageable pieces.
 *
 * @param text - The text to split.
 * @param chunkSizeChars - The character size of each chunk.
 * @param overlapChars - The number of characters to overlap between chunks.
 * @param verbose - Whether to enable verbose logging.
 * @returns An array of string chunks.
 */
export const splitTextIntoChunks = (
  text: string,
  chunkSizeChars: number,
  overlapChars: number = DEFAULT_CHUNK_OVERLAP_CHARS,
  verbose = false
): string[] => {
  if (!text || text.trim().length === 0) {
    if (verbose) {
      console.log(
        chalk.yellow("⚠️ Text is empty or only contains whitespace.")
      );
    }
    return [];
  }

  if (chunkSizeChars > text.length) {
    if (verbose) {
      console.warn(
        chalk.yellow(
          "⚠️ Chunk size is larger than text length. Returning text as is."
        )
      );
    }
    return [text];
  }

  if (overlapChars >= chunkSizeChars) {
    if (verbose) {
      console.warn(
        chalk.yellow(
          "⚠️ Overlap size is larger than or equal to chunk size. Setting overlap to 10% of chunk size."
        )
      );
    }
    overlapChars = Math.ceil(chunkSizeChars * 0.1);
  }

  const chunks = [];
  let i = 0;

  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSizeChars));
    i += chunkSizeChars - overlapChars;
  }

  if (verbose) {
    console.log(chalk.green(`✅ Split text into ${chunks.length} chunks.`));
  }

  return chunks;
};

/**
 * Prints the help message to the console.
 * Provides usage instructions and available options.
 *
 * @returns void
 */
export function printHelp(): void {
  const helpLines = [
    "Usage: tiratana [options]",
    "Options:",
    "  --directory <dir>  Directory to process",
    "  --help             Print this help message\n",
  ];

  for (const line of helpLines) {
    console.log(chalk.gray(line));
  }
}

/**
 * Generates a horizontal rule string.
 * Useful for separating sections in console output.
 *
 * @returns A string consisting of 80 hyphens.
 */
export function hr(): string {
  return "-".repeat(80);
}

/**
 * Logs the provided arguments in a formatted and readable manner.
 *
 * @param args - The command-line arguments to log.
 * @returns void
 */
export function prettyLogArgs(args: TiratanaArgs): void {
  const lines = [
    hr(),
    chalk.yellow("💎 Tiratana: Launched with args: 🚀"),
    chalk.blue(`  - args.directory: '${args.directory}'`),
    chalk.blue(`  - args.verbose: '${args.verbose}'`),
    chalk.blue(`  - args.outputFile: '${args.outputFile}'`),
    chalk.blue(`  - args.performanceStats: '${args.performanceStats}'`),
    chalk.blue(
      `  - args.writePreliminaryAnalysis: '${args.writePreliminaryAnalysis}'`
    ),
    chalk.blue(`  - args.standardize: '${args.standardize}'`),
    chalk.blue(`  - args.standardizationFile: '${args.standardizationFile}'`),
    hr(),
  ];

  for (const line of lines) {
    console.log(line);
  }
}

/**
 * Validates the provided command-line arguments.
 * Ensures that required arguments are present and valid.
 *
 * @param args - The arguments to validate.
 * @returns void
 */
export function validateArgs(args: TiratanaArgs): void {
  if (args && !args.directory) {
    console.log(
      chalk.redBright(
        "\nError: No directory provided.\n- Please pass directory with -d or --directory.\n"
      )
    );
    printHelp();
    process.exit(1);
  }
}

/**
 * Delays the execution of the program by a specified number of milliseconds.
 * @param ms The number of milliseconds to delay.
 * @returns A promise that resolves after the specified delay.
 */
export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Strips off ```markdown from a text if it exists.
 * Handles various edge cases and ensures the text is properly cleaned.
 *
 * @param text - The text to clean.
 * @param verbose - Whether to enable verbose logging.
 * @returns The cleaned text without ```markdown.
 */
export function stripMarkdown(text: string, verbose = false): string {
  try {
    if (typeof text !== "string") {
      throw new TypeError("Input must be a string.");
    }

    if (verbose) {
      console.log(chalk.blue("\n🔍 Stripping markdown from text."));
    }

    const markdownPattern = /```markdown\s*([\s\S]*?)\s*```/g;
    const result = text.replace(markdownPattern, (_, content) =>
      content.trim()
    );

    if (verbose) {
      console.log(chalk.green("✅ Markdown stripped successfully."));
    }

    return result;
  } catch (error: any) {
    console.error(
      chalk.redBright(`❌ Error stripping markdown: ${error.message}`)
    );
    return text;
  }
}

/**
 * Generates a fun and random file name with a specified extension.
 *
 * @param {string} extension - The file extension (e.g., 'txt', 'jpg').
 * @returns {string} - A randomly generated file name.
 */
export function generateFunFileName(extension: string): string {
  try {
    const randomName = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: "_",
      style: "lowerCase",
    });

    return `${randomName}.${extension}`;
  } catch (error: any) {
    const fallbackName = randomUUID();
    console.error(
      chalk.redBright(
        `❌ Error generating file name: ${error.message}. Using fallback name [${fallbackName}.${extension}].`
      )
    );
    return `${fallbackName}.${extension}`;
  }
}

/**
 * Prints the Tiratana banner to the console.
 */
export async function printBanner() {
  const bannerText = [
    chalk.blue(hr()),
    chalk.cyanBright("Tiratana 💎: Generate useful codebase reports easily!"),
    chalk.blue(hr()),
  ];

  for (const line of bannerText) {
    console.log(line);
  }
}
