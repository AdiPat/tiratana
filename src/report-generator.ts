import fs from "fs";
import path from "path";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { filterIgnoredFiles, splitTextIntoChunks } from "./utils";
import { Path } from "./types";

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
function getAllValidFiles(dir: Path, ignoreDirectories: string[], ignoreExtensions: string[]): Path[] | null {
  try {
    const allFiles = getAllFiles(dir);

    if (!allFiles) {
      throw new Error("failed to get all files in directory");
    }

    const filteredFiles = filterIgnoredFiles(allFiles, ignoreDirectories, ignoreExtensions);

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

export {
  getAllFiles,
  getAllValidFiles,
  getReportFilePath,
  createEmptyReport,
  writeReport,
  generateReport,
  clearReports,
};
