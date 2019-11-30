import { AggregatedResult } from "@jest/test-result";
import { Config } from "@jest/types";
import { writeFileSync } from "fs";
import mkdirp from "mkdirp";
import path from "path";

import { defaultOutputFile, defaultUserName } from "./constants";
import { generateTrx, IOptions } from "./trx-generator";

class TrxReporter {
  private options: IOptions;

  constructor(_: Config.GlobalConfig, options: IOptions) {
    this.options = {
      ...options,
      defaultUserName: options?.defaultUserName ?? defaultUserName,
      outputFile: options?.outputFile ?? defaultOutputFile,
    };
  }

  public onRunComplete = (
    _: any,
    aggregatedResults: AggregatedResult,
  ): Promise<void> | void => {
    const trx = generateTrx(aggregatedResults, this.options);

    const targetDir = path.dirname(path.resolve(this.options.outputFile));
    mkdirp.sync(targetDir);

    writeFileSync(this.options.outputFile, trx, { encoding: "utf8" });
    process.stdout.write("DONE\n");
    process.stdout.write(`TRX file output to '${this.options.outputFile}'\n`);
  }
}

module.exports = TrxReporter;
