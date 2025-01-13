/**
 *
 * Report Generator for Tiratana CLI.
 * @author Aditya Patange (AdiPat)
 * @description Report Generator for Tiratana CLI.
 * @file report-generator.ts
 * @license MIT
 * @module tiratana
 * ⚡️ "The easiest way to learn to code is to see the code of the best coders." — Aditya Patange
 *
 */
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import chalk from "chalk";
import fs from "fs/promises";
import path from "path";
import { performance } from "perf_hooks";
import {
  DEFAULT_LLM_MODEL,
  DEFAULT_LLM_TEMPERATURE,
  DEFAULT_PRELIMINARY_ANALYSIS_CHUNK_SIZE,
  MAX_TOKENS_LIMIT,
  TIRATANA_SYSTEM_PROMPT,
} from "./constants";
import { delay, hr, splitTextIntoChunks, stripMarkdown } from "./utils";
import { Loader } from "./loader";

const IGNORE_DIRECTORIES = [
  ".git",
  "node_modules",
  "dist",
  "build",
  "venv",
  "__pycache__",
  "target",
  "bin",
  "obj",
  "out",
];
const IGNORE_EXTENSIONS = [
  ".report.txt",
  ".log",
  ".class",
  ".pyc",
  ".o",
  ".out",
  ".exe",
  ".dll",
  ".so",
  ".a",
  ".dylib",
  ".jar",
  ".war",
  ".ear",
  ".min.js",
  ".map",
  ".lock",
  ".tsbuildinfo",
];

/**
 * Extract the paths of all files in a folder.
 * Recursively get all files in a folder path.
 * @param folderPath The folder path to get all files from.
 * @returns An array of file paths.
 */
export async function getAllFilesInFolder(
  folderPath: string
): Promise<string[]> {
  try {
    const stat = await fs.stat(folderPath);
    if (!stat.isDirectory()) {
      throw new Error(`Path "${folderPath}" is not a directory.`);
    }
  } catch (error) {
    throw new Error(`Folder path "${folderPath}" does not exist.`);
  }

  const files = await fs.readdir(folderPath);

  const allFiles = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(folderPath, file);
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        if (IGNORE_DIRECTORIES.includes(file)) {
          return [];
        }
        return getAllFilesInFolder(filePath);
      } else {
        if (IGNORE_EXTENSIONS.some((ext) => file.endsWith(ext))) {
          return [];
        }
        return filePath;
      }
    })
  );

  return allFiles.flat();
}

/**
 * Extracts the contents of all files in a folder.
 * @param files The files to get contents from.
 * @returns The contents of the files in an in the form { file: string, content: string }.
 */
export async function getFileContentsFromFiles(
  files: string[]
): Promise<{ file: string; content: string }[]> {
  const fileContents = await Promise.all(
    files.map(async (file) => {
      try {
        const content = await fs.readFile(file, "utf-8");
        return {
          file,
          content,
        };
      } catch (error) {
        console.error(chalk.redBright(`Failed to read file: ${file}.`));
        return {
          file,
          content: "",
        };
      }
    })
  );

  return fileContents;
}

/**
 * Performs Tiratana Analysis on a code file and generates a report.
 * @param codeFile The code file to analyze.
 * @returns The file path and the generated report in markdown format.
 */
export async function generateCodeFileAnalysis(codeFile: {
  filePath: string;
  content: string;
}): Promise<{ file: string; report: string }> {
  try {
    const system = TIRATANA_SYSTEM_PROMPT;
    const prompt = `
    I am giving you a file from a codebase.
    You need to analyze the file and generate a report. 

    File: ${codeFile.filePath}
    Content: ${codeFile.content}

    Instructions: 
    - Don't hallucinate or make up information.
    - Ensure the report is accurate and relevant.
    - Avoid too much verbosity, balance the level of detail in the report. 
    It should not be too brief or so detailed that there's redundant information.
    - Consider the context of the codebase and the file.

    Respond in valid markdown format.
  `;

    const llmConfig = {
      system,
      prompt,
      model: openai(DEFAULT_LLM_MODEL),
      temperature: DEFAULT_LLM_TEMPERATURE,
    };

    const { text: report } = await generateText(llmConfig);

    return { file: codeFile.filePath, report };
  } catch (error : any) {
    const errorMessage = `Failed to generate report for file: ${codeFile.filePath} due to unexpected system error.`;
    console.error(chalk.redBright(errorMessage));
    console.error(chalk.redBright(error?.message));
    return {
      file: codeFile.filePath,
      report: errorMessage,
    };
  }
}

/**
 * Compiles the 'Tiratana Codebase Report' from the preliminary analysis of a codebase.
 * @param directory The codebase directory to compile the report for.
 * @param preliminaryAnalysis The preliminary analysis of the codebase.
 * @param runningReport The running report to update.
 * @param startingIndex The starting index of the preliminary analysis chunks.
 * @param verbose Whether to enable verbose logging.
 * @returns The markdown report for the codebase or an error message.
 */
export async function compileReportFromPreliminaryAnalysis(
  directory: string,
  preliminaryAnalysis: string,
  runningReport = "",
  startingIndex = 0,
  verbose = false
): Promise<string> {
  if (runningReport && runningReport.trim() === "") {
    runningReport = `# Tiratana 💎: Codebase Analysis Report
    #### Codebase 🛖: ${directory}
    `;
  }

  let lastIndex = 0;
  let preliminaryAnalysisChunks = [];
  const chunkProcessingTimes: number[] = [];

  try {
    preliminaryAnalysisChunks = splitTextIntoChunks(
      preliminaryAnalysis,
      DEFAULT_PRELIMINARY_ANALYSIS_CHUNK_SIZE,
      undefined,
      verbose
    );
    const system = TIRATANA_SYSTEM_PROMPT;

    for (const preliminaryAnalysisChunk of preliminaryAnalysisChunks) {
      if (lastIndex < startingIndex) {
        lastIndex += 1;
        continue;
      }

      if (verbose) {
        console.log(
          chalk.yellow(
            `\n🔍 Processing preliminary analysis chunk ${lastIndex + 1}/${
              preliminaryAnalysisChunks.length
            }`
          )
        );
      }

      const chunkStartTime = performance.now();

      const prompt = `
      We analysed the codebase [${directory}] and generated preliminary reports for each file.
      I want you to take the key insights from the preliminary reports and compile them into a final report.
      I will give you a chunk of the preliminary report, and you need to summarize the key insights from it.
      Update the provided running report with the key insights.
      Make sure you 'augment' the report with the new information.
      Retain the context and coherence of the report.
      Make sure you don't delete important information from the running report.
      I am giving you a running report but you should respond with a final report I can show stakeholders.


      Preliminary Report Chunk: '''${preliminaryAnalysisChunk}'''
      Running Report: '''${runningReport}'''

      Respond in valid markdown format.
      `;

      const { text: report } = await generateText({
        system,
        prompt,
        model: openai(DEFAULT_LLM_MODEL),
        temperature: DEFAULT_LLM_TEMPERATURE,
        maxTokens: MAX_TOKENS_LIMIT,
      });

      runningReport = report;
      lastIndex += 1;

      const chunkEndTime = performance.now();
      chunkProcessingTimes.push(chunkEndTime - chunkStartTime);

      if (verbose) {
        console.log(
          chalk.green(
            `\n✅ Processed preliminary analysis chunk ${lastIndex}/${preliminaryAnalysisChunks.length}`
          )
        );
      }
    }

    return runningReport;
  } catch (error) {
    // complete the report with the remaining chunks in case of an error
    if (lastIndex < preliminaryAnalysisChunks.length) {
      return compileReportFromPreliminaryAnalysis(
        directory,
        preliminaryAnalysis,
        runningReport,
        lastIndex + 1,
        verbose
      );
    }

    const errorMessage = `Failed to compile report from preliminary analysis due to unexpected system error.`;
    console.error(chalk.redBright(errorMessage));
    return errorMessage;
  }
}

/**
 * Formats the performance stats for console.table.
 * @param stats The performance stats to format.
 * @returns The formatted performance stats.
 */
function formatPerformanceStatsForConsole(stats: {
  totalTime: number;
  fileAnalysisTime: number;
  reportCompilationTime: number;
  chunkProcessingTime: number;
  averageChunkProcessingTime: number;
  preliminaryAnalysisTime: number;
  averageFileProcessingTime: number;
}): { Index: number; Stage: string; Time: string }[] {
  const formatTime = (time: number) => `${(time / 1000).toFixed(2)} seconds`;

  return [
    { Index: 1, Stage: "Total Time", Time: formatTime(stats.totalTime) },
    {
      Index: 2,
      Stage: "File Analysis Time",
      Time: formatTime(stats.fileAnalysisTime),
    },
    {
      Index: 3,
      Stage: "Report Compilation Time",
      Time: formatTime(stats.reportCompilationTime),
    },
    {
      Index: 4,
      Stage: "Chunk Processing Time",
      Time: formatTime(stats.chunkProcessingTime),
    },
    {
      Index: 5,
      Stage: "Avg Chunk Processing Time",
      Time: formatTime(stats.averageChunkProcessingTime),
    },
    {
      Index: 6,
      Stage: "Preliminary Analysis Time",
      Time: formatTime(stats.preliminaryAnalysisTime),
    },
    {
      Index: 7,
      Stage: "Avg File Processing Time",
      Time: formatTime(stats.averageFileProcessingTime),
    },
  ];
}

/**
 * Standardizes a report so that it's easily readable and understandable.
 * @param report The markdown report to standardize.
 * @returns The standardized markdown report.
 */
export async function standardizeReport(report: string): Promise<{
  standardizedReport: string;
  performanceStats: {
    totalTime: number;
  };
}> {
  let startTime = performance.now();
  let standardizedReport = "";
  try {
    const { text: generatedReport } = await generateText({
      system: TIRATANA_SYSTEM_PROMPT,
      prompt: `
          I am giving you a report generated by the Tiratana AI System.
          Your task is to standardize the report so that it's easily readable and understandable.
          You need to make sure the report is well-formatted and follows the enterprise standards.
          The report should be clean, professional, and concise.
          Make sure the report is easy to read and comprehend.
          Respond in valid markdown format.


          The report should include the following sections: 
          
          - Architecture
          - Documentation
          - Comments
          - Dependencies
          - Technologies
          - Patterns
          - Vulnerabilities
          - Complexity
          - Maintainability
          - Best Practices
          - Performance
          - Code Smells
          - Refactoring
          - Testing
          - Conclusion 

          If there is not enough information for a particular section, you can skip it.
          Make sure the section includes atleast 1 paragraph (2 paragraphs will be the best for the user) of information or 8 bullet points.
          If there is not enough information for this much detail, then skip that piece of information. 

          Report: '''${report}'''
    `,
      model: openai(DEFAULT_LLM_MODEL),
      temperature: DEFAULT_LLM_TEMPERATURE,
      maxTokens: MAX_TOKENS_LIMIT,
    });

    standardizedReport = generatedReport;
  } catch (error: any) {
    console.error(
      chalk.redBright(
        `❌ Failed to standardize report due to unexpected system error.`
      )
    );
    standardizedReport = `# Sorry, couldn't standardize your report. 😐`;
  }

  let endTime = performance.now();
  let totalTime = endTime - startTime;
  return {
    standardizedReport,
    performanceStats: {
      totalTime,
    },
  };
}

/**
 * Generates a report for all code files in a folder.
 * @param folderPath The folder path to analyze.
 * @returns The markdown report for all code files in the folder or an error message.
 */
export async function generateReport(
  directory: string,
  verbose = false,
  performanceStats = false
): Promise<{
  preliminaryAnalysis: string;
  report: string;
  performance?: {
    totalTime: number;
    fileAnalysisTime: number;
    reportCompilationTime: number;
    chunkProcessingTime: number;
    averageChunkProcessingTime: number;
    preliminaryAnalysisTime: number;
    averageFileProcessingTime: number;
  };
  performanceTable?: string;
}> {
  const startTime = performance.now();
  let fileAnalysisStartTime = 0;
  let fileAnalysisEndTime = 0;
  let reportCompilationStartTime = 0;
  let reportCompilationEndTime = 0;
  const fileProcessingTimes: number[] = [];

  try {
    if (verbose) {
      console.log(
        chalk.green(`🚀 Starting report generation for directory: ${directory}`)
      );
    }

    const files = await getAllFilesInFolder(directory);
    if (verbose) {
      console.log(
        chalk.blue(`📂 Found ${files.length} files in directory: ${directory}`)
      );
    }

    const fileContents = await getFileContentsFromFiles(files);
    if (verbose) {
      console.log(
        chalk.blue(`📄 Retrieved contents for ${fileContents.length} files`)
      );
    }

    let preliminaryAnalysis = `# Preliminary Analysis for Folder: ${directory}\n\n`;

    fileAnalysisStartTime = performance.now();
    for (const codeFile of fileContents) {
      const fileStartTime = performance.now();

      await Loader.load(
        async () => {
          const { file, report } = await generateCodeFileAnalysis({
            filePath: codeFile.file,
            content: codeFile.content,
          });

          const cleanedReport = stripMarkdown(report, verbose);

          if (verbose) {
            console.log(chalk.green(`✅ Generated report for file: ${file}`));
          }

          await delay(100);
          preliminaryAnalysis += `## File: ${file}\n\n${cleanedReport}\n\n`;
          preliminaryAnalysis += "---\n\n";
        },
        1000,
        `Analyzing file: ${codeFile.file}`,
        "yellow",
        "magenta"
      );

      const fileEndTime = performance.now();
      fileProcessingTimes.push(fileEndTime - fileStartTime);
    }
    fileAnalysisEndTime = performance.now();

    preliminaryAnalysis = stripMarkdown(preliminaryAnalysis, verbose);

    if (verbose) {
      console.log(
        chalk.green(
          `🎉 Completed report generation for directory: ${directory}`
        )
      );
    }

    let report = "";

    reportCompilationStartTime = performance.now();
    await Loader.load(
      async () => {
        report = await compileReportFromPreliminaryAnalysis(
          directory,
          preliminaryAnalysis,
          "",
          0,
          verbose
        );
      },
      1000,
      `Compiling final report for directory: ${directory}`,
      "yellow",
      "magenta"
    );
    reportCompilationEndTime = performance.now();

    if (!report || report.trim() === "") {
      console.error(
        chalk.redBright(
          `❌ Failed to generate report for folder: ${directory}.`
        )
      );
      return {
        preliminaryAnalysis,
        report: `# Sorry, couldn't generate your report. 😐`,
      };
    }

    if (verbose) {
      console.log(chalk.green(`📄 Standardizing report for you.`));
    }

    const {
      standardizedReport,
      performanceStats: standardizationPerformanceStats,
    } = await standardizeReport(report);

    if (verbose) {
      console.log(
        chalk.green(
          `📄 Standardized report for directory generated: ${directory}.`
        )
      );
    }

    if (verbose) {
      console.log(
        chalk.green(`📄 Final report compiled for directory: ${directory}`)
      );
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const fileAnalysisTime = fileAnalysisEndTime - fileAnalysisStartTime;
    const reportCompilationTime =
      reportCompilationEndTime - reportCompilationStartTime;
    const chunkProcessingTime = fileProcessingTimes.reduce(
      (acc, time) => acc + time,
      0
    );
    const averageChunkProcessingTime =
      chunkProcessingTime / fileProcessingTimes.length;
    const preliminaryAnalysisTime = fileAnalysisEndTime - fileAnalysisStartTime;
    const averageFileProcessingTime =
      fileProcessingTimes.reduce((acc, time) => acc + time, 0) /
      fileProcessingTimes.length;

    const result: any = {
      preliminaryAnalysis,
      report: standardizedReport,
    };

    if (performanceStats) {
      result.performance = {
        totalTime,
        fileAnalysisTime,
        reportCompilationTime,
        chunkProcessingTime,
        averageChunkProcessingTime,
        preliminaryAnalysisTime,
        averageFileProcessingTime,
        standardizationTime: standardizationPerformanceStats.totalTime,
      };
      result.performanceTable = formatPerformanceStatsForConsole(
        result.performance
      );
    }

    return result;
  } catch (error) {
    const errorMessage = `Failed to generate report for folder: ${directory} due to unexpected system error.`;
    console.error(chalk.redBright(`❌ ${errorMessage}`));
    const errorMarkdown = `
    # Sorry, couldn't generate your report. 😐
    UserSpace message:${errorMessage}
    SystemSpace message: ${error}`;
    return {
      preliminaryAnalysis: errorMarkdown,
      report: errorMarkdown,
    };
  }
}
