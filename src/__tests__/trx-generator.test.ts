import "jest";
import xml2js = require("xml2js");
import xmlbuilder = require("xmlbuilder");
import { generateTrx, IOptions } from "../trx-generator";
import {
  JestTestResult,
  JestTestRunResult,
  JestTestSuiteResult,
} from "../types";

describe("trx-generator", (): void => {
  it("processes the results correctly", (done): void => {
    const input: JestTestRunResult = {
      success: true,
      startTime: 1478771929,
      numTotalTestSuites: 1,
      numPassedTestSuites: 0,
      numFailedTestSuites: 1,
      numPendingTestSuites: 0,
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
              ancestorTitles: ["foo's", "bar method"],
              failureMessages: [],
              numPassingAsserts: 1,
              status: "passed",
              title: "works well",
            },
            {
              ancestorTitles: ["foo's", "bar method"],
              failureMessages: ["This did not go as planned"],
              numPassingAsserts: 1,
              status: "failed",
              title: "works not so well",
            },
          ],
        },
      ],
    };
    const result: string = generateTrx(input);
    xml2js.parseString(result, (err, parsed) => {
      expect(err).toBeFalsy();
      expect(parsed).toBeTruthy();
      expect(parsed.TestRun).toBeTruthy();
      expect(parsed.TestRun.$).toBeTruthy();
      expect(parsed.TestRun.$.xmlns).toEqual(
        "http://microsoft.com/schemas/VisualStudio/TeamTest/2010",
      );
      expect(parsed.TestRun.Results).toBeTruthy();
      expect(parsed.TestRun.Results.length).toEqual(1);
      expect(parsed.TestRun.Results[0].UnitTestResult.length).toEqual(2);
      expect(parsed.TestRun.Results[0].UnitTestResult[0].$.outcome).toEqual(
        "Passed",
      );
      expect(parsed.TestRun.Results[0].UnitTestResult[0].$.duration).toEqual(
        "00:00:03.500",
      );
      expect(parsed.TestRun.Results[0].UnitTestResult[1].$.outcome).toEqual(
        "Failed",
      );
      expect(parsed.TestRun.Results[0].UnitTestResult[1].$.duration).toEqual(
        "00:00:03.500",
      );

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
      numPendingTestSuites: 0,
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
              ancestorTitles: ["foo's", "bar method"],
              failureMessages: [],
              numPassingAsserts: 1,
              status: "passed",
              title: "works well",
            },
            {
              ancestorTitles: ["foo's", "bar method"],
              failureMessages: ["This did not go as planned\uDFFF"],
              numPassingAsserts: 1,
              status: "failed",
              title: "works not so well",
            },
          ],
        },
      ],
    };
    const result: string = generateTrx(input);
    expect(result).toBeTruthy();
  });

  it("handles skipped test suites", (): void => {
    const input: JestTestRunResult = {
      numFailedTestSuites: 0,
      numFailedTests: 0,
      numPassedTestSuites: 0,
      numPassedTests: 0,
      numPendingTestSuites: 1,
      numPendingTests: 1,
      numRuntimeErrorTestSuites: 0,
      numTotalTestSuites: 1,
      numTotalTests: 1,
      snapshot: {
        added: 0,
        didUpdate: false,
        failure: false,
        filesAdded: 0,
        filesRemoved: 0,
        filesUnmatched: 0,
        filesUpdated: 0,
        matched: 0,
        total: 0,
        unchecked: 0,
        unmatched: 0,
        updated: 0,
      },
      startTime: 1511376995239,
      success: true,
      testResults: [
        {
          numFailingTests: 0,
          numPassingTests: 0,
          numPendingTests: 1,
          perfStats: {
            end: 1511376996104,
            start: 1511376995923,
          },
          snapshot: {
            added: 0,
            fileDeleted: false,
            matched: 0,
            unchecked: 0,
            unmatched: 0,
            updated: 0,
          },
          testFilePath: "C:\\Users\\Github\\test\\test.spec.js",
          testResults: [
            {
              ancestorTitles: [],
              duration: 0,
              failureMessages: [],
              fullName: "first",
              numPassingAsserts: 0,
              status: "pending",
              title: "first",
            },
          ],
          sourceMaps: {},
          skipped: true,
        },
      ],
      wasInterrupted: false,
    };
    const result: string = generateTrx(input);
    expect(result).toBeTruthy();
  });

  it("verify runtime suite failures", done => {
    const input: JestTestRunResult = {
      numFailedTestSuites: 0,
      numFailedTests: 0,
      numPassedTestSuites: 1,
      numPassedTests: 1,
      numPendingTestSuites: 0,
      numPendingTests: 0,
      numRuntimeErrorTestSuites: 1,
      numTotalTestSuites: 2,
      numTotalTests: 1,
      snapshot: {
        added: 0,
        didUpdate: false,
        failure: false,
        filesAdded: 0,
        filesRemoved: 0,
        filesUnmatched: 0,
        filesUpdated: 0,
        matched: 0,
        total: 0,
        unchecked: 0,
        unmatched: 0,
        updated: 0,
      },
      startTime: 1511376995239,
      success: false,
      testResults: [
        {
          numFailingTests: 0,
          numPassingTests: 1,
          numPendingTests: 0,
          perfStats: {
            end: 1511376996104,
            start: 1511376995923,
          },
          snapshot: {
            added: 0,
            fileDeleted: false,
            matched: 0,
            unchecked: 0,
            unmatched: 0,
            updated: 0,
          },
          testFilePath: "C:\\Users\\Github\\test\\test.spec.js",
          testResults: [
            {
              ancestorTitles: [],
              duration: 0,
              failureMessages: [],
              fullName: "first",
              numPassingAsserts: 0,
              status: "passed",
              title: "first",
            },
          ],
          sourceMaps: {},
          skipped: false,
        },
        {
          failureMessage: "Test suite failed with runtime error",
          numFailingTests: 0,
          numPassingTests: 0,
          numPendingTests: 0,
          perfStats: {
            end: 1511376996104,
            start: 1511376995923,
          },
          snapshot: {
            added: 0,
            fileDeleted: false,
            matched: 0,
            unchecked: 0,
            unmatched: 0,
            updated: 0,
          },
          testFilePath: "C:\\Users\\Github\\test\\test.spec2.js",
          testResults: [],
          sourceMaps: {},
          skipped: false,
        },
      ],
      wasInterrupted: false,
    };

    const result: string = generateTrx(input);

    // Verify the summary has the proper test counts.
    xml2js.parseString(result, (err, parsed) => {
      expect(err).toBeFalsy();
      expect(parsed).toBeTruthy();
      expect(parsed.TestRun).toBeTruthy();
      expect(parsed.TestRun.$).toBeTruthy();
      expect(parsed.TestRun.$.xmlns).toEqual(
        "http://microsoft.com/schemas/VisualStudio/TeamTest/2010",
      );
      expect(parsed.TestRun.Results).toBeTruthy();
      expect(parsed.TestRun.Results.length).toEqual(1);
      expect(parsed.TestRun.Results[0].UnitTestResult.length).toEqual(2);
      expect(parsed.TestRun.Results[0].UnitTestResult.length).toEqual(2);

      // Verify the summary values.
      expect(parsed.TestRun.ResultSummary[0].$.outcome).toBe("Failed");
      expect(parsed.TestRun.ResultSummary[0].Counters[0].$.total).toBe("2");
      expect(parsed.TestRun.ResultSummary[0].Counters[0].$.executed).toBe("1");
      expect(parsed.TestRun.ResultSummary[0].Counters[0].$.passed).toBe("1");
      expect(parsed.TestRun.ResultSummary[0].Counters[0].$.failed).toBe("0");
      expect(parsed.TestRun.ResultSummary[0].Counters[0].$.error).toBe("1");

      // First test passed
      expect(parsed.TestRun.Results[0].UnitTestResult[0].$.outcome).toEqual(
        "Passed",
      );
      expect(parsed.TestRun.Results[0].UnitTestResult[0].$.duration).toEqual(
        "00:00:00.181",
      );

      // Second test result represents the failed suite.
      expect(parsed.TestRun.Results[0].UnitTestResult[1].$.outcome).toEqual(
        "Failed",
      );
      expect(parsed.TestRun.Results[0].UnitTestResult[1].$.duration).toEqual(
        "0",
      );
      expect(
        parsed.TestRun.Results[0].UnitTestResult[1].Output[0].ErrorInfo[0]
          .Message[0],
      ).toEqual("Test suite failed with runtime error");

      done();
    });
  });

  it("verify postprocess handler", done => {
    const input: JestTestRunResult = {
      numFailedTestSuites: 0,
      numFailedTests: 0,
      numPassedTestSuites: 1,
      numPassedTests: 1,
      numPendingTestSuites: 0,
      numPendingTests: 0,
      numRuntimeErrorTestSuites: 0,
      numTotalTestSuites: 1,
      numTotalTests: 1,
      snapshot: {
        added: 0,
        didUpdate: false,
        failure: false,
        filesAdded: 0,
        filesRemoved: 0,
        filesUnmatched: 0,
        filesUpdated: 0,
        matched: 0,
        total: 0,
        unchecked: 0,
        unmatched: 0,
        updated: 0,
      },
      startTime: 1511376995239,
      success: true,
      testResults: [
        {
          numFailingTests: 0,
          numPassingTests: 1,
          numPendingTests: 0,
          perfStats: {
            end: 1511376996104,
            start: 1511376995923,
          },
          snapshot: {
            added: 0,
            fileDeleted: false,
            matched: 0,
            unchecked: 0,
            unmatched: 0,
            updated: 0,
          },
          testFilePath: "C:\\Users\\Github\\test\\test.spec.js",
          testResults: [
            {
              ancestorTitles: [],
              duration: 0,
              failureMessages: [],
              fullName: "first",
              numPassingAsserts: 0,
              status: "passed",
              title: "first",
            },
          ],
          sourceMaps: {},
          skipped: false,
        },
      ],
      wasInterrupted: false,
    };

    const addResultFile = (
      testSuiteResult: JestTestSuiteResult,
      testResult: JestTestResult,
      testResultNode: xmlbuilder.XMLElement,
    ): void => {
      testResultNode
        .ele("ResultFiles")
        .ele("ResultFile")
        .att("path", "C:\\Users\\Github\\test\\test.spec.js");
    };

    const options: IOptions = {
      outputFile: "",
      postProcessTestResult: [addResultFile],
    };
    const result: string = generateTrx(input, options);

    xml2js.parseString(result, (err, parsed) => {
      // Verify the file was added to the UnitTestResult.
      expect(parsed.TestRun.Results[0].UnitTestResult[0].$.outcome).toEqual(
        "Passed",
      );
      expect(
        parsed.TestRun.Results[0].UnitTestResult[0].ResultFiles[0]
          .ResultFile[0],
      ).toBeTruthy();
      expect(
        parsed.TestRun.Results[0].UnitTestResult[0].ResultFiles[0].ResultFile[0]
          .$.path,
      ).toBe("C:\\Users\\Github\\test\\test.spec.js");

      done();
    });
  });
});
