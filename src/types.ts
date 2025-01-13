/**
 *
 * Types for the Tiratana CLI.
 * @author Aditya Patange (AdiPat)
 * @description Types for the Tiratana CLI.
 * @file types.ts
 * @license MIT
 * @module tiratana
 * ⚡️ "The best way to learn to code is to code." — Oen
 *
 */

/**
 * The command-line arguments for the Tiratana CLI.
 * @interface TiratanaArgs
 * @property {string} directory - The directory to process.
 * @property {string} [outputFile] - The output file to write the report to.
 * @property {boolean} [verbose] - Print verbose logs.
 * @property {boolean} [performanceStats] - Print performance statistics.
 * @property {boolean} [writePreliminaryAnalysis] - Write preliminary analysis to a file.
 * @property {boolean} [standardize] - Standardize the report.
 * @property {string} [standardizationFile] - The file to use for standardization.
 * @property {string} [env] - The environment file to use for configuration.
 * 
 */
interface TiratanaArgs {
  directory: string;
  outputFile?: string;
  verbose?: boolean;
  performanceStats?: boolean;
  writePreliminaryAnalysis?: boolean;
  standardize?: boolean;
  standardizationFile?: string;
  env?: string;
}

/**
 *
 * A file path.
 * @typedef {string} Path
 * @description A file path.
 *
 */
type Path = string;

export { TiratanaArgs, Path };
