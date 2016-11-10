import "jest";
import { generateTrx } from "../trx-generator";
import { JestTestRunResult } from "../types";
import xml2js = require("xml2js");

describe("trx-generator", (): void => {
  it("processes the results correctly", (done): void => {
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
    xml2js.parseString(result, (err, parsed) => {
      expect(err).toBeFalsy();
      expect(parsed).toBeTruthy();
      expect(parsed.TestRun).toBeTruthy();
      expect(parsed.TestRun.$).toBeTruthy();
      expect(parsed.TestRun.$.xmlns).toEqual("http://microsoft.com/schemas/VisualStudio/TeamTest/2010");
      expect(parsed.TestRun.Results).toBeTruthy();
      expect(parsed.TestRun.Results.length).toEqual(1);
      expect(parsed.TestRun.Results[0].UnitTestResult.length).toEqual(2);
      expect(parsed.TestRun.Results[0].UnitTestResult[0].$.outcome).toEqual("Passed");
      expect(parsed.TestRun.Results[0].UnitTestResult[0].$.duration).toEqual("00:00:03.500");
      expect(parsed.TestRun.Results[0].UnitTestResult[1].$.outcome).toEqual("Failed");
      expect(parsed.TestRun.Results[0].UnitTestResult[1].$.duration).toEqual("00:00:03.500");

      done();
    });
  });

  it("handles error message with invalid XML chars correctly", (): void => {
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
              failureMessages: ["This did not go as planned\uDFFF"];
              numPassingAsserts: 1;
              status: "failed";
              title: "works not so well";
            }
          ]
        }
      ],
    };
    const result: string = generateTrx(input);
    expect(result).toBeTruthy();
  });
});
