import { writeFileSync } from "fs";

import { generateTrx } from "./trx-generator";
import { JestTestResult, JestTestRunResult, JestTestSuiteResult } from "./types";

/**
 * All the configuration options.
 */
interface IOptions {
  /**
   * Path to the resulting TRX file.
   * @default "test-results.trx"
   */
  outputFile: string;
}

const processor = (options: IOptions = {
  outputFile: "test-results.trx",
}) => (testRunResult: JestTestRunResult): JestTestRunResult => {
  process.stdout.write("Generating TRX file...");

  const trx = generateTrx(testRunResult);

  writeFileSync(options.outputFile, trx, { encoding: "utf8" });
  process.stdout.write("DONE\n");
  process.stdout.write(`TRX file output to '${options.outputFile}'\n`);

  // Return the input testRunResult to allow for chaining other result processors
  return testRunResult;
};

export = processor;
