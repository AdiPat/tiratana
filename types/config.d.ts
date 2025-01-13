/**
 *
 * The configuration module for the Tiratana AI System.
 * @author Aditya Patange (AdiPat)
 * @description Configuration module for the Tiratana AI System.
 * @file config.ts
 * @license MIT
 * @module tiratana
 * ⚡️ "I don't configure what I can't figure." — AdiPat
 *
 */
declare module "readline" {
    interface Interface {
        stdoutMuted?: boolean;
    }
}
export declare function assertEnvVariable(name: string): string;
export declare function assertAllEnvVariables(verbose?: boolean): boolean;
/**
 * Prompts the user to enter the required environment variables.
 * @param verbose The verbosity flag.
 * @returns void
 */
export declare function promptUserForEnvVariables(verbose?: boolean): Promise<void>;
/**
 * Initializes the configuration for the Tiratana AI System.
 * @param verbose The verbosity flag.
 */
export declare function initConfig(verbose?: boolean): Promise<void>;
