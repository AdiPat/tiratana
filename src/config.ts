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

import dotenv from "dotenv";
import chalk from "chalk";
import { createInterface } from "readline";
import { REQUIRED_ENV_VARIABLES } from "./constants";
import readline from "readline";
import { execSync } from "child_process";

declare module "readline" {
  interface Interface {
    stdoutMuted?: boolean;
  }
}

// required so that input string is invisible when typing
(readline.Interface.prototype as any)._writeToOutput = function _writeToOutput(
  stringToWrite: string
) {
  if (this.stdoutMuted) this.output.write("*");
  else this.output.write(stringToWrite);
};

export function assertEnvVariable(name: string): string {
  const value = process.env[name];
  if (value === undefined) {
    return "";
  }
  return value;
}

export function assertAllEnvVariables(verbose = false): boolean {
  const envsToAssert = REQUIRED_ENV_VARIABLES;

  if (verbose) {
    console.log(
      chalk.blue(`ℹ️  Asserting environment variables: ${envsToAssert}`)
    );
  }

  let status = true;

  envsToAssert.forEach((env) => {
    const assertionResult = assertEnvVariable(env);

    if (!assertionResult || assertionResult === "") {
      console.error(
        chalk.redBright(`Error: Environment variable ${env} is not set.`)
      );
      status = false;
    }
  });

  if (!status) {
    console.error(
      chalk.redBright(
        `❗️ One or more required environment variables are missing.`
      )
    );
    return false;
  }

  if (verbose) {
    console.log(
      chalk.green(
        `✅ All environment variables asserted successfully: ${envsToAssert.join(
          ","
        )}`
      )
    );
  }

  return status;
}

/**
 * Prompts the user to enter the required environment variables.
 * @param verbose The verbosity flag.
 * @returns void
 */
export async function promptUserForEnvVariables(
  verbose = false
): Promise<void> {
  const envsToPrompt = REQUIRED_ENV_VARIABLES;

  try {
    if (verbose) {
      console.log(
        chalk.blue(
          `ℹ️  Prompting user for environment variables: ${envsToPrompt}`
        )
      );
    }

    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    for (const env of envsToPrompt) {
      const value = process.env[env];
      if (!value) {
        const answer = await new Promise((resolve) => {
          rl.question(
            chalk.magentaBright(
              `Please enter the value for environment variable ${env}: `
            ),
            (answer) => {
              resolve(answer);
            }
          );
          rl.stdoutMuted = true;
        });

        setEnvProperty(env, answer as string);
        console.log(chalk.green(`✅ Environment variable ${env} set.`));
      }
    }
    rl.close();
  } catch (error: any) {
    console.error(
      chalk.redBright(
        `Failed to read env variables from user due to system error.`
      )
    );

    if (verbose) {
      console.error(chalk.redBright(`❗️ Error: ${error.message}`));
    }
  }
}

/**
 * Initializes the configuration for the Tiratana AI System.
 * @param verbose The verbosity flag.
 */
export async function initConfig(verbose = false) {
  dotenv.config();
  const status = assertAllEnvVariables(verbose);

  if (!status) {
    await promptUserForEnvVariables(verbose);
  }
}

/** 
 * Function to set environment variables.
 * @param key The key of the environment variable.
 * @param value The value of the environment variable.
 * @returns void
 */ 
export function setEnvProperty(key: string, value: string): void {
  process.env[key] = value;
  console.log(chalk.green(`Environment variable ${key} set to ${value}`));

  // Set environment variable for the current session
  if (process.platform === "win32") {
    execSync(`setx ${key} "${value}"`);
  } else {
    execSync(`export ${key}="${value}"`);
  }
}
/**
 * Loads the environment variables from a file.
 * @param filePath The path to the environment file.
 * @returns void
 */
export function loadEnvFromFile (filePath: string): void {
  try {
    dotenv.config({ path: filePath, override: true });
    console.log(chalk.green(`✅ Environment variables loaded from ${filePath}`));
  } catch (error : any) {
    console.error(chalk.redBright(`❌ Error loading environment variables from ${filePath}`));
    console.error(chalk.redBright(`❌ Error: ${error.message }`));
  }
}