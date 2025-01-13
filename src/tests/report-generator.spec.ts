import { describe, expect, it } from "vitest";
import {
  getAllFilesInFolder,
  getFileContentsFromFiles,
} from "../report-generator";

describe("Report Generator", () => {
  describe("get all files in folder", () => {
    it("should return all files in a folder excluding .git files", async () => {
      const folderPath = "./test_folder";

      const files = await getAllFilesInFolder(folderPath);

      const expectedFiles = [
        "test_folder/llm-classifier-go/.gitignore",
        "test_folder/llm-classifier-go/LICENSE",
        "test_folder/llm-classifier-go/README.md",
        "test_folder/llm-classifier-go/core/ai.go",
        "test_folder/llm-classifier-go/core/ai_test.go",
        "test_folder/llm-classifier-go/core/classifier.go",
        "test_folder/llm-classifier-go/core/classifier_test.go",
        "test_folder/llm-classifier-go/core/config_manager.go",
        "test_folder/llm-classifier-go/core/config_manager_test.go",
        "test_folder/llm-classifier-go/core/utils.go",
        "test_folder/llm-classifier-go/core/utils_test.go",
        "test_folder/llm-classifier-go/datasets/mobile_price_test.csv",
        "test_folder/llm-classifier-go/datasets/mobile_price_train.csv",
        "test_folder/llm-classifier-go/datasets/student_performance.csv",
        "test_folder/llm-classifier-go/datasets/twitter_training.csv",
        "test_folder/llm-classifier-go/datasets/twitter_validation.csv",
        "test_folder/llm-classifier-go/examples/mobile_price.go",
        "test_folder/llm-classifier-go/examples/twitter_sentiment_analysis.go",
        "test_folder/llm-classifier-go/go.mod",
        "test_folder/llm-classifier-go/go.sum",
        "test_folder/llm-classifier-go/main.go",
        "test_folder/unified-search/.gitignore",
        "test_folder/unified-search/LICENSE",
        "test_folder/unified-search/README.md",
        "test_folder/unified-search/package-lock.json",
        "test_folder/unified-search/package.json",
        "test_folder/unified-search/playwright.config.ts",
        "test_folder/unified-search/src/core/clients/bing-search.ts",
        "test_folder/unified-search/src/core/clients/duck-duck-go-search.ts",
        "test_folder/unified-search/src/core/clients/google-search.ts",
        "test_folder/unified-search/src/core/clients/yahoo-search.ts",
        "test_folder/unified-search/src/core/constants.ts",
        "test_folder/unified-search/src/core/index.ts",
        "test_folder/unified-search/src/core/search-engine.ts",
        "test_folder/unified-search/src/core/utils.ts",
        "test_folder/unified-search/src/example.ts",
        "test_folder/unified-search/src/index.ts",
        "test_folder/unified-search/tests/core/clients/bing-search.test.ts",
        "test_folder/unified-search/tests/core/clients/duck-duck-go-search.test.ts",
        "test_folder/unified-search/tests/core/clients/google-search.test.ts",
        "test_folder/unified-search/tests/core/clients/yahoo-search.test.ts",
        "test_folder/unified-search/tsconfig.json",
      ];

      expectedFiles.forEach((expectedFile) => {
        expect(files).toContain(expectedFile);
      });
    });
  });

  describe("get file contents from files", () => {
    it("should return the contents of all files in a folder", async () => {
      const files = [
        "test_folder/llm-classifier-go/core/ai.go",
        "test_folder/unified-search/tsconfig.json",
      ];

      const fileContents = await getFileContentsFromFiles(files);

      // NOTE: Yes I use logic in tests, because my life my rules 😎
      fileContents.forEach((fileContent) => {
        expect(fileContent.content).toEqual(expect.any(String));
        expect(fileContent.content).not.toBe("");
        expect(fileContent.content).not.toBeNull();
      });

      expect(fileContents).toEqual([
        {
          file: "test_folder/llm-classifier-go/core/ai.go",
          content: expect.any(String),
        },
        {
          file: "test_folder/unified-search/tsconfig.json",
          content: expect.any(String),
        },
      ]);
    });
  });
});
