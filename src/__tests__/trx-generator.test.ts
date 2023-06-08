import {
  AggregatedResult,
  AssertionResult,
  SnapshotSummary,
  TestResult,
} from "@jest/test-result";
import "jest";
import xml2js = require("xml2js");
import xmlbuilder = require("xmlbuilder");
import { generateTrx, IOptions } from "../trx-generator";

describe("trx-generator", (): void => {
  const emptySnapshotSummary: SnapshotSummary = {
    added: 0,
    didUpdate: false,
    failure: false,
    filesAdded: 0,
    filesRemoved: 0,
    filesRemovedList: [],
    filesUnmatched: 0,
    filesUpdated: 0,
    matched: 0,
    total: 0,
    unchecked: 0,
    uncheckedKeysByFile: [],
    unmatched: 0,
    updated: 0,
  };

  const emptySnapshot: TestResult["snapshot"] = {
    added: 0,
    fileDeleted: false,
    matched: 0,
    unchecked: 0,
    uncheckedKeys: [],
    unmatched: 0,
    updated: 0,
  };

  it("processes the results correctly", (done): void => {
    const input: AggregatedResult = {
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
      numTodoTests: 0,
      openHandles: [],
      snapshot: emptySnapshotSummary,
      testResults: [
        {
          coverage: {},
          leaks: false,
          numFailingTests: 1,
          numPassingTests: 1,
          numPendingTests: 0,
          numTodoTests: 0,
          openHandles: [],
          perfStats: {
            start: 1478771929,
            end: 1478778929,
            runtime: 0,
            slow: false,
          },
          skipped: false,
          snapshot: emptySnapshot,
          testFilePath: "C:\\testPath\\test.js",
          testResults: [
            {
              ancestorTitles: ["foo's", "bar method"],
              failureMessages: [],
              numPassingAsserts: 1,
              status: "passed",
              title: "works well",
              fullName: "foo's > bar method > works well",
              location: {
                column: 0,
                line: 0,
              },
              failureDetails: [],
              duration: 4100,
            },
            {
              ancestorTitles: ["foo's", "bar method"],
              failureMessages: ["This did not go as planned"],
              numPassingAsserts: 1,
              status: "failed",
              title: "works not so well",
              fullName: "foo's > bar method > works not so well",
              location: {
                column: 0,
                line: 0,
              },
              failureDetails: [],
              duration: 2900,
            },
          ],
        },
      ],
      wasInterrupted: false,
    };
    const result = generateTrx(input);
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
        "00:00:04.100",
      );
      expect(parsed.TestRun.Results[0].UnitTestResult[1].$.outcome).toEqual(
        "Failed",
      );
      expect(parsed.TestRun.Results[0].UnitTestResult[1].$.duration).toEqual(
        "00:00:02.900",
      );

      done();
    });
  });

  it("handles error message with invalid XML chars correctly", (): void => {
    const input: AggregatedResult = {
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
      numTodoTests: 0,
      openHandles: [],
      snapshot: emptySnapshotSummary,
      testResults: [
        {
          coverage: {},
          leaks: false,
          numFailingTests: 1,
          numPassingTests: 1,
          numPendingTests: 0,
          numTodoTests: 0,
          openHandles: [],
          skipped: false,
          snapshot: emptySnapshot,
          perfStats: {
            start: 1478771929,
            end: 1478778929,
            runtime: 0,
            slow: false,
          },
          testFilePath: "C:\\testPath\\test.js",
          testResults: [
            {
              ancestorTitles: ["foo's", "bar method"],
              failureMessages: [],
              numPassingAsserts: 1,
              status: "passed",
              title: "works well",
              fullName: "foo's > bar method > works well",
              location: {
                column: 0,
                line: 0,
              },
              failureDetails: [],
              duration: 4100,
            },
            {
              ancestorTitles: ["foo's", "bar method"],
              failureMessages: ["This did not go as planned\uDFFF"],
              numPassingAsserts: 1,
              status: "failed",
              title: "works not so well",
              fullName: "foo's > bar method > works not so well",
              location: {
                column: 0,
                line: 0,
              },
              failureDetails: [],
              duration: 2900,
            },
          ],
        },
      ],
      wasInterrupted: false,
    };
    const result = generateTrx(input);
    expect(result).toBeTruthy();
  });

  it("handles skipped test suites", (): void => {
    const input: AggregatedResult = {
      numFailedTestSuites: 0,
      numFailedTests: 0,
      numPassedTestSuites: 0,
      numPassedTests: 0,
      numPendingTestSuites: 1,
      numPendingTests: 1,
      numRuntimeErrorTestSuites: 0,
      numTodoTests: 0,
      numTotalTestSuites: 1,
      numTotalTests: 1,
      openHandles: [],
      snapshot: emptySnapshotSummary,
      startTime: 1511376995239,
      success: true,
      testResults: [
        {
          leaks: false,
          numFailingTests: 0,
          numPassingTests: 0,
          numPendingTests: 1,
          numTodoTests: 0,
          openHandles: [],
          perfStats: {
            end: 1511376996104,
            start: 1511376995923,
            runtime: 181,
            slow: false,
          },
          snapshot: emptySnapshot,
          testFilePath: "C:\\Users\\Github\\test\\test.spec.js",
          testResults: [
            {
              ancestorTitles: [],
              duration: 181,
              failureMessages: [],
              fullName: "first",
              numPassingAsserts: 0,
              status: "pending",
              title: "first",
              location: {
                column: 0,
                line: 0,
              },
              failureDetails: [],
            },
          ],
          sourceMaps: {},
          skipped: true,
        },
      ],
      wasInterrupted: false,
    };
    const result = generateTrx(input);
    expect(result).toBeTruthy();
  });

  it("handles todo tests", (): void => {
    const input: AggregatedResult = {
      numFailedTestSuites: 0,
      numFailedTests: 0,
      numPassedTestSuites: 0,
      numPassedTests: 0,
      numPendingTestSuites: 0,
      numPendingTests: 0,
      numRuntimeErrorTestSuites: 0,
      numTodoTests: 1,
      numTotalTestSuites: 1,
      numTotalTests: 1,
      openHandles: [],
      snapshot: emptySnapshotSummary,
      startTime: 1511376995239,
      success: true,
      testResults: [
        {
          leaks: false,
          numFailingTests: 0,
          numPassingTests: 0,
          numPendingTests: 0,
          numTodoTests: 1,
          openHandles: [],
          perfStats: {
            end: 1511376996104,
            start: 1511376995923,
            runtime: 181,
            slow: false,
          },
          snapshot: emptySnapshot,
          testFilePath: "C:\\Users\\Github\\test\\test.spec.js",
          testResults: [
            {
              ancestorTitles: [],
              duration: 181,
              failureMessages: [],
              fullName: "first",
              numPassingAsserts: 0,
              status: "todo",
              title: "first",
              location: {
                column: 0,
                line: 0,
              },
              failureDetails: [],
            },
          ],
          sourceMaps: {},
          skipped: true,
        },
      ],
      wasInterrupted: false,
    };
    const result = generateTrx(input);
    expect(result).toBeTruthy();
  });

  it("verify runtime suite failures", (done) => {
    const input: AggregatedResult = {
      numFailedTestSuites: 0,
      numFailedTests: 0,
      numPassedTestSuites: 1,
      numPassedTests: 1,
      numPendingTestSuites: 0,
      numPendingTests: 0,
      numRuntimeErrorTestSuites: 1,
      numTodoTests: 0,
      numTotalTestSuites: 2,
      numTotalTests: 1,
      openHandles: [],
      snapshot: emptySnapshotSummary,
      startTime: 1511376995239,
      success: false,
      testResults: [
        {
          leaks: false,
          numFailingTests: 0,
          numPassingTests: 1,
          numPendingTests: 0,
          numTodoTests: 0,
          openHandles: [],
          perfStats: {
            end: 1511376996104,
            start: 1511376995923,
            runtime: 181,
            slow: false,
          },
          snapshot: emptySnapshot,
          testFilePath: "C:\\Users\\Github\\test\\test.spec.js",
          testResults: [
            {
              ancestorTitles: [],
              duration: 181,
              failureMessages: [],
              fullName: "first",
              numPassingAsserts: 0,
              status: "passed",
              title: "first",
              location: {
                column: 0,
                line: 0,
              },
              failureDetails: [],
            },
          ],
          sourceMaps: {},
          skipped: false,
        },
        {
          failureMessage: "Test suite failed with runtime error",
          leaks: false,
          numFailingTests: 0,
          numPassingTests: 0,
          numPendingTests: 0,
          numTodoTests: 0,
          openHandles: [],
          perfStats: {
            end: 1511376996104,
            start: 1511376995923,
            runtime: 181,
            slow: false,
          },
          snapshot: emptySnapshot,
          testFilePath: "C:\\Users\\Github\\test\\test.spec2.js",
          testResults: [],
          sourceMaps: {},
          skipped: false,
          testExecError: {
            message: '',
            stack: 'Failing stack',
          }
        },
      ],
      wasInterrupted: false,
    };

    const result = generateTrx(input);

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
      ).toEqual("Failing stack");

      done();
    });
  });

  it("verify runtime suite failures with passing tests", (done) => {
    const input: AggregatedResult = {
      numFailedTestSuites: 1,
      numFailedTests: 0,
      numPassedTestSuites: 0,
      numPassedTests: 1,
      numPendingTestSuites: 0,
      numPendingTests: 0,
      numRuntimeErrorTestSuites: 1,
      numTodoTests: 0,
      numTotalTestSuites: 1,
      numTotalTests: 1,
      openHandles: [],
      snapshot: emptySnapshotSummary,
      startTime: 1511376995239,
      success: false,
      testResults: [
        {
          failureMessage: "Test suite failed with runtime error",
          leaks: false,
          numFailingTests: 0,
          numPassingTests: 1,
          numPendingTests: 0,
          numTodoTests: 0,
          openHandles: [],
          perfStats: {
            end: 1511376996104,
            start: 1511376995923,
            runtime: 181,
            slow: false,
          },
          snapshot: emptySnapshot,
          testFilePath: "C:\\Users\\Github\\test\\test.spec.js",
          testResults: [
            {
              ancestorTitles: [],
              duration: 181,
              failureMessages: [],
              fullName: "first",
              numPassingAsserts: 0,
              status: "passed",
              title: "first",
              location: {
                column: 0,
                line: 0,
              },
              failureDetails: [],
            },
          ],
          sourceMaps: {},
          skipped: false,
          testExecError: {
            message: '',
            stack: 'Failing stack',
          }
        },
      ],
      wasInterrupted: false,
    };

    const result = generateTrx(input);

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
      ).toEqual("Failing stack");

      done();
    });
  });

  it("verify postprocess handler", (done) => {
    const input: AggregatedResult = {
      numFailedTestSuites: 0,
      numFailedTests: 0,
      numPassedTestSuites: 1,
      numPassedTests: 1,
      numPendingTestSuites: 0,
      numPendingTests: 0,
      numRuntimeErrorTestSuites: 0,
      numTodoTests: 0,
      numTotalTestSuites: 1,
      numTotalTests: 1,
      openHandles: [],
      snapshot: emptySnapshotSummary,
      startTime: 1511376995239,
      success: true,
      testResults: [
        {
          leaks: false,
          numFailingTests: 0,
          numPassingTests: 1,
          numPendingTests: 0,
          numTodoTests: 0,
          openHandles: [],
          perfStats: {
            end: 1511376996104,
            start: 1511376995923,
            runtime: 181,
            slow: false,
          },
          snapshot: emptySnapshot,
          testFilePath: "C:\\Users\\Github\\test\\test.spec.js",
          testResults: [
            {
              ancestorTitles: [],
              duration: 181,
              failureMessages: [],
              fullName: "first",
              numPassingAsserts: 0,
              status: "passed",
              title: "first",
              location: {
                column: 0,
                line: 0,
              },
              failureDetails: [],
            },
          ],
          sourceMaps: {},
          skipped: false,
        },
      ],
      wasInterrupted: false,
    };

    const addResultFile = (
      testSuiteResult: TestResult,
      testResult: AssertionResult,
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
    const result = generateTrx(input, options);

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

  it("calculate finishTime from test results", (done) => {
    const input: AggregatedResult = {
      numFailedTestSuites: 0,
      numFailedTests: 0,
      numPassedTestSuites: 1,
      numPassedTests: 1,
      numPendingTestSuites: 0,
      numPendingTests: 0,
      numRuntimeErrorTestSuites: 1,
      numTodoTests: 0,
      numTotalTestSuites: 2,
      numTotalTests: 1,
      openHandles: [],
      snapshot: emptySnapshotSummary,
      startTime: 1511376995239,
      success: false,
      testResults: [
        {
          leaks: false,
          numFailingTests: 0,
          numPassingTests: 1,
          numPendingTests: 0,
          numTodoTests: 0,
          openHandles: [],
          perfStats: {
            end: 1511376996104,
            start: 1511376995923,
            runtime: 181,
            slow: false,
          },
          snapshot: emptySnapshot,
          testFilePath: "C:\\Users\\Github\\test\\test.spec.js",
          testResults: [
            {
              ancestorTitles: [],
              duration: 181,
              failureMessages: [],
              fullName: "first",
              numPassingAsserts: 0,
              status: "passed",
              title: "first",
              location: {
                column: 0,
                line: 0,
              },
              failureDetails: [],
            },
          ],
          sourceMaps: {},
          skipped: false,
        },
        {
          leaks: false,
          numFailingTests: 0,
          numPassingTests: 1,
          numPendingTests: 0,
          numTodoTests: 0,
          openHandles: [],
          perfStats: {
            end: 1511376996304,
            start: 1511376996104,
            runtime: 200,
            slow: false,
          },
          snapshot: emptySnapshot,
          testFilePath: "C:\\Users\\Github\\test\\test.spec.js",
          testResults: [
            {
              ancestorTitles: [],
              duration: 181,
              failureMessages: [],
              fullName: "first",
              numPassingAsserts: 0,
              status: "passed",
              title: "first",
              location: {
                column: 0,
                line: 0,
              },
              failureDetails: [],
            },
          ],
          sourceMaps: {},
          skipped: false,
        },
      ],
      wasInterrupted: false,
    };

    const result = generateTrx(input);

    xml2js.parseString(result, (err, parsed) => {
      expect(err).toBeFalsy();
      expect(parsed).toBeTruthy();
      expect(parsed.TestRun).toBeTruthy();

      const timeElement = parsed.TestRun.Times[0].$;
      expect(timeElement).toBeTruthy();
      expect(timeElement.start).toBeTruthy();
      expect(timeElement.finish).toBeTruthy();
      expect(timeElement.start).not.toEqual(timeElement.finish);
      expect(timeElement.start).toEqual(new Date(1511376995239).toISOString());
      expect(timeElement.finish).toEqual(new Date(1511376995239 + 200 + 181).toISOString());

      done();
    });
  });
});
