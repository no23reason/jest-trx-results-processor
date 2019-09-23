import { AggregatedResult } from "@jest/test-result";
import { writeFileSync } from "fs";
import mkdirp from "mkdirp";
import path from "path";

import { generateTrx, IOptions } from "./trx-generator";

const processor = (
  options: IOptions = {
    outputFile: "test-results.trx",
    defaultUserName: "anonymous",
  },
) => (testRunResult: AggregatedResult): AggregatedResult => {
  process.stdout.write("Generating TRX file...");

  const trx = generateTrx(testRunResult, options);

  const targetDir = path.dirname(path.resolve(options.outputFile));
  mkdirp.sync(targetDir);

  writeFileSync(options.outputFile, trx, { encoding: "utf8" });
  process.stdout.write("DONE\n");
  process.stdout.write(`TRX file output to '${options.outputFile}'\n`);

  // Return the input testRunResult to allow for chaining other result processors
  return testRunResult;
};

export = processor;
