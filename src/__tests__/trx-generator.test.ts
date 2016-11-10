import "jest";
import { generateTrx } from "../trx-generator";
import { JestTestRunResult } from "../types";

describe("trx-generator", (): void => {
  it("processes the results correctly", (): void => {
    const input: JestTestRunResult = {
      success: true,
      startTime: 1478771929,
      numTotalTestSuites: 1,
      numPassedTestSuites: 0,
      numFailedTestSuites: 1,
      numRuntimeErrorTestSuites: 0,
      numTotalTests: 2,
      numPassedTests: 1,
      numFailedTests: 1,
      numPendingTests: 0,
      testResults: [
        {
          coverage: {},
          numFailingTests: 1,
          numPassingTests: 1,
          numPendingTests: 0,
          perfStats: {
            start: 1478771929,
            end: 1478778929,
          },
          testFilePath: "C:\\testPath\\test.js",
          testResults: [
            {
              ancestorTitles: ["foo's", "bar method"];
              failureMessages: [];
              numPassingAsserts: 1;
              status: "passed";
              title: "works well";
            },
            {
              ancestorTitles: ["foo's", "bar method"];
              failureMessages: ["This did not go as planned"];
              numPassingAsserts: 1;
              status: "failed";
              title: "works not so well";
            }
          ]
        }
      ],
    };
    const result: string = generateTrx(input);
    expect(result).toMatchSnapshot();
  });
});