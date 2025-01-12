import dotenv from "dotenv";
import chalk from "chalk";

function assertEnvVariable(name: string): string {
  const value = process.env[name];
  if (value === undefined) {
    return "";
  }
  return value;
}

function assertAllEnvVariables(verbose = false): void {
  const envsToAssert = ["OPENAI_API_KEY"];

  if (verbose) {
    console.log(
      chalk.blue(`ℹ️  Asserting environment variables: ${envsToAssert}`)
    );
  }

  envsToAssert.forEach((env) => {
    const assertionResult = assertEnvVariable(env);

    if (!assertionResult || assertionResult === "") {
      console.error(
        chalk.redBright(`Error: Environment variable ${name} is not set.`)
      );
      process.exit(1);
    }
  });

  if (verbose) {
    console.log(
      chalk.green(
        `✅ All environment variables asserted successfully: ${envsToAssert.join(
          ","
        )}`
      )
    );
  }
}

export async function initConfig(verbose = false) {
  dotenv.config();
  assertAllEnvVariables(verbose);
}
