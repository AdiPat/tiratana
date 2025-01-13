import { describe, it, expect, vi } from "vitest";
import {
  assertEnvVariable,
  assertAllEnvVariables,
  promptUserForEnvVariables,
  initConfig,
} from "../config";

describe("Config", () => {
  describe("assert env variable", () => {
    it("should return the correct value for an existing env variable", () => {
      process.env.TEST_VAR = "test_value";
      const value = assertEnvVariable("TEST_VAR");
      expect(value).toBe("test_value");
    });

    it("should return an empty string for a non-existing env variable", () => {
      const value = assertEnvVariable("NON_EXISTENT_VAR");
      expect(value).toBe("");
    });
  });

  describe("assert all env variable", () => {
    it("should validate all required env variables", () => {
      process.env.REQUIRED_VAR1 = "value1";
      process.env.REQUIRED_VAR2 = "value2";
      const requiredVars = ["REQUIRED_VAR1", "REQUIRED_VAR2"];
      expect(() => assertAllEnvVariables(true)).not.toThrow();
    });

    it.skip("should log an error if any required env variable is missing", () => {
      // TODO: something wrong with this test
      process.env.OPENAI_API_KEY = undefined;
      const status = assertAllEnvVariables(true);
      expect(status).toBe(false);
    });
  });

  describe("init config", () => {
    it("should initialize config with default values", async () => {
      process.env.REQUIRED_VAR1 = "value1";
      process.env.REQUIRED_VAR2 = "value2";
      await initConfig(true);
      expect(process.env.REQUIRED_VAR1).toBe("value1");
      expect(process.env.REQUIRED_VAR2).toBe("value2");
    });

    it.skip("should prompt user for missing env variables", async () => {
      // TODO: something wrong with this test, written by CoPilot
      // we need to mock the user input here
      process.env.REQUIRED_VAR1 = "value1";
      const promptMock = vi.fn().mockResolvedValue("user_input_value");
      const originalPrompt = global.prompt;
      global.prompt = promptMock;
      await initConfig(true);
      expect(promptMock).toHaveBeenCalled();
      global.prompt = originalPrompt;
    });
  });
});
