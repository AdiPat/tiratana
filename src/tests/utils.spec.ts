import { describe, it, expect } from "vitest";
import { splitTextIntoChunks } from "../utils";

describe("Utilities", () => {
  describe("split text into chunks", () => {
    it("should split text into chunks of specified size without overlap", () => {
      const text = "abcdefghij";
      const chunkSize = 3;
      const chunks = splitTextIntoChunks(text, chunkSize, 0);
      expect(chunks).toEqual(["abc", "def", "ghi", "j"]);
    });

    it("should split text into chunks of specified size with overlap", () => {
      const text = "abcdefghij";
      const chunkSize = 3;
      const overlap = 1;
      const chunks = splitTextIntoChunks(text, chunkSize, overlap);
      expect(chunks).toEqual(["abc", "cde", "efg", "ghi", "ij"]);
    });

    it("should use default overlap of 10% chunk size if not provided", () => {
      const text = "abcdefghij";
      const chunkSize = 3;
      const chunks = splitTextIntoChunks(text, chunkSize);
      expect(chunks).toEqual(["abc", "cde", "efg", "ghi", "ij"]);
    });

    it("should handle empty text", () => {
      const text = "";
      const chunkSize = 3;
      const chunks = splitTextIntoChunks(text, chunkSize);
      expect(chunks).toEqual([]);
    });

    it("should handle chunk size larger than text length", () => {
      const text = "abc";
      const chunkSize = 10;
      const chunks = splitTextIntoChunks(text, chunkSize);
      expect(chunks).toEqual(["abc"]);
    });
  });
});
