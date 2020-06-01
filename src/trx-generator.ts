import {
  AggregatedResult,
  AssertionResult,
  TestResult,
} from "@jest/test-result";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { create as createXmlBuilder, XMLElement } from "xmlbuilder";

import {
  testListAllLoadedResultsId,
  testListNotInListId,
  testOutcomeTable,
  testType,
} from "./constants";
import {
  formatDuration,
  getEnvInfo,
  getFullTestName,
  getSuitePerTestDuration,
  getTestClassName,
} from "./utils";

/**
 * All the configuration options.
 */
export interface IOptions {
  /**
   * Path to the resulting TRX file.
   * @default "test-results.trx"
   */
  outputFile: string;

  /**
   * The username to use if the real username cannot be detected.
   * @default "anonymous"
   */
  defaultUserName?: string;

  /**
   * Set of methods that may be used to augment the resulting trx file.
   * Each of these methods are called after the testResultNode has been generated.
   */
  postProcessTestResult?: [
    (
      testSuiteResult: TestResult,
      testResult: AssertionResult,
      testResultNode: XMLElement,
    ) => void,
  ];
}

const renderTestRun = (
  builder: XMLElement,
  testRunResult: AggregatedResult,
  computerName: string,
  userName?: string,
): void => {
  builder
    .att("id", uuidv4())
    .att(
      "name",
      `${userName}@${computerName} ${new Date(
        testRunResult.startTime,
      ).toISOString()}`,
    )
    .att("runUser", userName)
    .att("xmlns", "http://microsoft.com/schemas/VisualStudio/TeamTest/2010");
};

const renderTestSettings = (parentNode: XMLElement): void => {
  parentNode
    .ele("TestSettings")
    .att("name", "Jest test run")
    .att("id", uuidv4());
};

const renderTimes = (
  parentNode: XMLElement,
  testRunResult: AggregatedResult,
): void => {
  const startTime = new Date(testRunResult.startTime).toISOString();
  parentNode
    .ele("Times")
    .att("creation", startTime)
    .att("queuing", startTime)
    .att("start", startTime)
    .att("finish", startTime);
};

const renderResultSummary = (
  parentNode: XMLElement,
  testRunResult: AggregatedResult,
): void => {
  // workaround for https://github.com/facebook/jest/issues/6924
  const anyTestFailures = !(
    testRunResult.numFailedTests === 0 &&
    testRunResult.numRuntimeErrorTestSuites === 0
  );

  const isSuccess = !(anyTestFailures || testRunResult.snapshot.failure);

  const summary = parentNode
    .ele("ResultSummary")
    .att("outcome", isSuccess ? "Passed" : "Failed");

  summary
    .ele("Counters")
    .att(
      "total",
      testRunResult.numTotalTests + testRunResult.numRuntimeErrorTestSuites,
    )
    .att(
      "executed",
      testRunResult.numTotalTests - testRunResult.numPendingTests,
    )
    .att("passed", testRunResult.numPassedTests)
    .att("failed", testRunResult.numFailedTests)
    .att("error", testRunResult.numRuntimeErrorTestSuites);
};

const renderTestLists = (parentNode: XMLElement): void => {
  const testLists = parentNode.ele("TestLists");

  testLists
    .ele("TestList")
    .att("name", "Results Not in a List")
    .att("id", testListNotInListId);

  testLists
    .ele("TestList")
    .att("name", "All Loaded Results")
    .att("id", testListAllLoadedResultsId);
};

const renderTestSuiteResult = (
  testSuiteResult: TestResult,
  testDefinitionsNode: XMLElement,
  testEntriesNode: XMLElement,
  resultsNode: XMLElement,
  computerName: string,
  postProcessTestResult?: [
    (
      testSuiteResult: TestResult,
      testResult: AssertionResult,
      testResultNode: XMLElement,
    ) => void,
  ],
): void => {
  const perTestDuration = getSuitePerTestDuration(testSuiteResult);
  const perTestDurationFormatted = formatDuration(perTestDuration);

  if (testSuiteResult.testResults && testSuiteResult.testResults.length) {
    testSuiteResult.testResults.forEach((testResult, index) => {
      const testId = uuidv4();
      const executionId = uuidv4();
      const fullTestName = getFullTestName(testResult);
      const fullTestPath = path.basename(testSuiteResult.testFilePath);

      // UnitTest
      const unitTest = testDefinitionsNode
        .ele("UnitTest")
        .att("name", fullTestName)
        .att("id", testId);
      unitTest.ele("Execution").att("id", executionId);
      unitTest
        .ele("TestMethod")
        .att("codeBase", `Jest_${fullTestPath}`)
        .att("name", fullTestName)
        .att("className", getTestClassName(testResult));

      // TestEntry
      testEntriesNode
        .ele("TestEntry")
        .att("testId", testId)
        .att("executionId", executionId)
        .att("testListId", testListNotInListId);

      // UnitTestResult
      const result = resultsNode
        .ele("UnitTestResult")
        .att("testId", testId)
        .att("executionId", executionId)
        .att("testName", fullTestName)
        .att("computerName", computerName)
        .att("duration", perTestDurationFormatted)
        .att(
          "startTime",
          new Date(
            testSuiteResult.perfStats.start + index * perTestDuration,
          ).toISOString(),
        )
        .att(
          "endTime",
          new Date(
            testSuiteResult.perfStats.start + (index + 1) * perTestDuration,
          ).toISOString(),
        )
        .att("testType", testType)
        .att("outcome", testOutcomeTable[testResult.status])
        .att("testListId", testListNotInListId);

      if (testResult.status === "failed") {
        result
          .ele("Output")
          .ele("ErrorInfo")
          .ele("Message", testResult.failureMessages.join("\n"));
      }

      // Perform any post processing for this test result.
      if (postProcessTestResult) {
        postProcessTestResult.forEach(postProcess =>
          postProcess(testSuiteResult, testResult, result),
        );
      }
    });
  } else if (testSuiteResult.failureMessage) {
    // For suites that failed to run, we will generate a test result that documents the failure.
    // This occurs when there is a failure compiling/loading the suite, not when a test in the suite fails.
    const testId = uuidv4();
    const executionId = uuidv4();
    const fullTestName = path.basename(testSuiteResult.testFilePath);
    const time = new Date().toISOString();

    // Failed TestSuite
    const unitTest = testDefinitionsNode
      .ele("UnitTest")
      .att("name", fullTestName)
      .att("id", testId);
    unitTest.ele("Execution").att("id", executionId);
    unitTest
      .ele("TestMethod")
      .att("codeBase", `Jest_${fullTestName}`)
      .att("name", fullTestName)
      .att("className", fullTestName);
    // TestEntry
    testEntriesNode
      .ele("TestEntry")
      .att("testId", testId)
      .att("executionId", executionId)
      .att("testListId", testListNotInListId);
    // UnitTestResult
    const result = resultsNode
      .ele("UnitTestResult")
      .att("testId", testId)
      .att("executionId", executionId)
      .att("testName", fullTestName)
      .att("computerName", computerName)
      .att("duration", "0")
      .att("startTime", time)
      .att("endTime", time)
      .att("testType", testType)
      .att("outcome", testOutcomeTable.failed)
      .att("testListId", testListNotInListId);
    result
      .ele("Output")
      .ele("ErrorInfo")
      .ele("Message", testSuiteResult.failureMessage);
  }
};

export const generateTrx = (
  testRunResult: AggregatedResult,
  options?: IOptions,
): string => {
  const { computerName, userName } = getEnvInfo(
    options && options.defaultUserName,
  );

  const resultBuilder = createXmlBuilder("TestRun", {
    invalidCharReplacement: "",
    version: "1.0",
    encoding: "UTF-8",
  });

  renderTestRun(resultBuilder, testRunResult, computerName, userName);

  renderTestSettings(resultBuilder);

  renderTimes(resultBuilder, testRunResult);

  renderResultSummary(resultBuilder, testRunResult);

  const testDefinitions = resultBuilder.ele("TestDefinitions");

  renderTestLists(resultBuilder);

  const testEntries = resultBuilder.ele("TestEntries");
  const results = resultBuilder.ele("Results");

  testRunResult.testResults.forEach(testSuiteResult =>
    renderTestSuiteResult(
      testSuiteResult,
      testDefinitions,
      testEntries,
      results,
      computerName,
      options && options.postProcessTestResult,
    ),
  );

  return resultBuilder.end({ pretty: true });
};
