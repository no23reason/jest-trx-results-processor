import { AggregatedResult } from "@jest/test-result";
import { Config } from "@jest/types";
import { writeFileSync } from "fs";
import { generateTrx, IOptions } from "./trx-generator";

class TrxReporter {
  constructor(
    _: Config.GlobalConfig,
    private options: IOptions = {
      outputFile: "test-results.trx",
      defaultUserName: "anonymous",
    },
  ) {}

  public onRunComplete = (
    _: any,
    aggregatedResults: AggregatedResult,
  ): Promise<void> | void => {
    const trx = generateTrx(aggregatedResults, this.options);

    writeFileSync(this.options.outputFile, trx, { encoding: "utf8" });
    process.stdout.write("DONE\n");
    process.stdout.write(`TRX file output to '${this.options.outputFile}'\n`);
  }
}

module.exports = TrxReporter;
