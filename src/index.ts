type Path = string;

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

function run(directory: string): void {
  const files = getAllFiles(directory);

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
