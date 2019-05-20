import { writeFileSync } from "fs";
import { generateTrx, IOptions } from "./trx-generator";
import { JestTestRunResult } from "./types";

const processor = (
  options: IOptions = {
    outputFile: "test-results.trx",
  },
) => (testRunResult: JestTestRunResult): JestTestRunResult => {
  process.stdout.write("Generating TRX file...");

  const trx = generateTrx(testRunResult, options);

  writeFileSync(options.outputFile, trx, { encoding: "utf8" });
  process.stdout.write("DONE\n");
  process.stdout.write(`TRX file output to '${options.outputFile}'\n`);

  // Return the input testRunResult to allow for chaining other result processors
  return testRunResult;
};

export = processor;
