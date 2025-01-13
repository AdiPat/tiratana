/**
 * Extract the paths of all files in a folder.
 * Recursively get all files in a folder path.
 * @param folderPath The folder path to get all files from.
 * @returns An array of file paths.
 */
export declare function getAllFilesInFolder(folderPath: string): Promise<string[]>;
/**
 * Extracts the contents of all files in a folder.
 * @param files The files to get contents from.
 * @returns The contents of the files in an in the form { file: string, content: string }.
 */
export declare function getFileContentsFromFiles(files: string[]): Promise<{
    file: string;
    content: string;
}[]>;
/**
 * Performs Tiratana Analysis on a code file and generates a report.
 * @param codeFile The code file to analyze.
 * @returns The file path and the generated report in markdown format.
 */
export declare function generateCodeFileAnalysis(codeFile: {
    filePath: string;
    content: string;
}): Promise<{
    file: string;
    report: string;
}>;
/**
 * Compiles the 'Tiratana Codebase Report' from the preliminary analysis of a codebase.
 * @param directory The codebase directory to compile the report for.
 * @param preliminaryAnalysis The preliminary analysis of the codebase.
 * @param runningReport The running report to update.
 * @param startingIndex The starting index of the preliminary analysis chunks.
 * @param verbose Whether to enable verbose logging.
 * @returns The markdown report for the codebase or an error message.
 */
export declare function compileReportFromPreliminaryAnalysis(directory: string, preliminaryAnalysis: string, runningReport?: string, startingIndex?: number, verbose?: boolean): Promise<string>;
/**
 * Standardizes a report so that it's easily readable and understandable.
 * @param report The markdown report to standardize.
 * @returns The standardized markdown report.
 */
export declare function standardizeReport(report: string): Promise<{
    standardizedReport: string;
    performanceStats: {
        totalTime: number;
    };
}>;
/**
 * Generates a report for all code files in a folder.
 * @param folderPath The folder path to analyze.
 * @returns The markdown report for all code files in the folder or an error message.
 */
export declare function generateReport(directory: string, verbose?: boolean, performanceStats?: boolean): Promise<{
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
}>;
