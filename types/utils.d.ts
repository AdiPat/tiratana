import { TiratanaArgs } from "./types";
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
export declare const splitTextIntoChunks: (text: string, chunkSizeChars: number, overlapChars?: number, verbose?: boolean) => string[];
/**
 * Prints the help message to the console.
 * Provides usage instructions and available options.
 *
 * @returns void
 */
export declare function printHelp(): void;
/**
 * Generates a horizontal rule string.
 * Useful for separating sections in console output.
 *
 * @returns A string consisting of 80 hyphens.
 */
export declare function hr(): string;
/**
 * Logs the provided arguments in a formatted and readable manner.
 *
 * @param args - The command-line arguments to log.
 * @returns void
 */
export declare function prettyLogArgs(args: TiratanaArgs): void;
/**
 * Validates the provided command-line arguments.
 * Ensures that required arguments are present and valid.
 *
 * @param args - The arguments to validate.
 * @returns void
 */
export declare function validateArgs(args: TiratanaArgs): void;
/**
 * Delays the execution of the program by a specified number of milliseconds.
 * @param ms The number of milliseconds to delay.
 * @returns A promise that resolves after the specified delay.
 */
export declare function delay(ms: number): Promise<void>;
/**
 * Strips off ```markdown from a text if it exists.
 * Handles various edge cases and ensures the text is properly cleaned.
 *
 * @param text - The text to clean.
 * @param verbose - Whether to enable verbose logging.
 * @returns The cleaned text without ```markdown.
 */
export declare function stripMarkdown(text: string, verbose?: boolean): string;
/**
 * Generates a fun and random file name with a specified extension.
 *
 * @param {string} extension - The file extension (e.g., 'txt', 'jpg').
 * @returns {string} - A randomly generated file name.
 */
export declare function generateFunFileName(extension: string): string;
/**
 * Prints the Tiratana banner to the console.
 */
export declare function printBanner(): Promise<void>;
