import * as os from "os";
import * as uuid from "uuid";
import {
  create as createXmlBuilder,
  XMLDocType,
  XMLElementOrXMLNode,
} from "xmlbuilder";

import {
  testListAllLoadedResultsId,
  testListNotInListId,
  testOutcomeTable,
  testType,
} from "./constants";
import {
  JestTestResult,
  JestTestRunResult,
  JestTestSuiteResult,
} from "./types";
import {
  formatDuration,
  getFullTestName,
  getSuitePerTestDuration,
  getTestClassName,
  sanitizeString,
} from "./utils";

const renderTestRun = (
  builder: XMLElementOrXMLNode,
  testRunResult: JestTestRunResult,
  computerName: string,
  userName: string,
) =>
  builder
    .att("id", uuid.v4())
    .att(
      "name",
      `${userName}@${computerName} ${new Date(
        testRunResult.startTime,
      ).toISOString()}`,
    )
    .att("runUser", userName)
    .att("xmlns", "http://microsoft.com/schemas/VisualStudio/TeamTest/2010");

const renderTestSettings = (builder: XMLElementOrXMLNode) =>
  builder
    .ele("TestSettings")
    .att("name", "Jest test run")
    .att("id", uuid.v4());

const renderTimes = (
  builder: XMLElementOrXMLNode,
  testRunResult: JestTestRunResult,
) => {
  const startTime = new Date(testRunResult.startTime).toISOString();
  builder
    .ele("Times")
    .att("creation", startTime)
    .att("queuing", startTime)
    .att("start", startTime);
};

const renderResultSummary = (
  builder: XMLElementOrXMLNode,
  testRunResult: JestTestRunResult,
) => {
  const summary = builder
    .ele("ResultSummary")
    .att("outcome", testRunResult.success ? "Passed" : "Failed");
  summary
    .ele("Counters")
    .att("total", testRunResult.numTotalTests)
    .att(
      "executed",
      testRunResult.numTotalTests - testRunResult.numPendingTests,
    )
    .att("passed", testRunResult.numPassedTests)
    .att("failed", testRunResult.numFailedTests)
    .att("error", 0);
};

const renderTestLists = (builder: XMLElementOrXMLNode) => {
  const testLists = builder.ele("TestLists");
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
  testSuiteResult: JestTestSuiteResult,
  testDefinitionsNode: XMLElementOrXMLNode,
  testEntriesNode: XMLElementOrXMLNode,
  resultsNode: XMLElementOrXMLNode,
  computerName: string,
) => {
  const perTestDuration = getSuitePerTestDuration(testSuiteResult);
  const perTestDurationFormatted = formatDuration(perTestDuration);

  testSuiteResult.testResults.forEach((testResult, index) => {
    const testId = uuid.v4();
    const executionId = uuid.v4();
    const fullTestName = getFullTestName(testResult);

    // UnitTest
    const unitTest = testDefinitionsNode
      .ele("UnitTest")
      .att("name", fullTestName)
      .att("id", testId);
    unitTest.ele("Execution").att("id", executionId);
    unitTest
      .ele("TestMethod")
      .att("codeBase", `Jest_${fullTestName}`)
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
        .ele("Message", sanitizeString(testResult.failureMessages.join("\n")));
    }
  });
};

export const generateTrx = (testRunResult: JestTestRunResult): string => {
  const computerName = os.hostname();
  const userName =
    process.env.SUDO_USER ||
    process.env.LOGNAME ||
    process.env.USER ||
    process.env.LNAME ||
    process.env.USERNAME;

  const resultBuilder = createXmlBuilder("TestRun", {
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
    ),
  );

  return resultBuilder.end({ pretty: true });
};
