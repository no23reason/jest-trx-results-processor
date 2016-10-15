import * as builder from "xmlbuilder";
import * as uuid from "uuid";
import * as os from "os";
import { writeFileSync } from "fs";

type UnixTime = number;

type JestTestResult = {
  ancestorTitles: string[]; // array of messages in describe blocks
  failureMessages: string[];
  numPassingAsserts: number;
  status: "failed" | "pending" | "passed";
  title: string; // message in it block
}

type JestTestSuiteResult = {
  coverage: {};
  numFailingTests: number;
  numPassingTests: number;
  numPendingTests: number;
  perfStats: {
    start: UnixTime;
    end: UnixTime;
  };
  testFilePath: string; // absolute path to test file;
  testResults: JestTestResult[];
};

type JestTestRunResult = {
  success: boolean;
  startTime: UnixTime;
  numTotalTestSuites: number;
  numPassedTestSuites: number;
  numFailedTestSuites: number;
  numRuntimeErrorTestSuites: number;
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numPendingTests: number;
  testResults: JestTestSuiteResult[];
}

const testListNotInListId = "8c84fa94-04c1-424b-9868-57a2d4851a1d";
const testListAllLoadedResultsId = "19431567-8539-422a-85d7-44ee4e166bda";
const testType = "13cdc9d9-ddb5-4fa4-a97d-d965ccfc6d4b";

const getFullTestName = (testResult: JestTestResult): string =>
  testResult.ancestorTitles && testResult.ancestorTitles.length
    ? `${testResult.ancestorTitles.join(" / ")} / ${testResult.title}`
    : testResult.title;

const getTestClassName = (testResult: JestTestResult): string =>
  testResult.ancestorTitles && testResult.ancestorTitles.length
    ? testResult.ancestorTitles[0]
    : "No suite";

const getSuitePerTestDuration = (testSuiteResult: JestTestSuiteResult): number =>
  // take the total duration of suite and divide it by the number of tests (Jest does not provide per test info)
  Math.floor((testSuiteResult.perfStats.end - testSuiteResult.perfStats.start) / (testSuiteResult.numPassingTests + testSuiteResult.numFailingTests));

const formatDuration = (duration: number): string => {
  let durationInner = duration | 0;
  const ms = durationInner % 1000;
  durationInner -= ms;
  const s = (durationInner / 1000) % 60;
  durationInner -= s * 1000;
  const m = (durationInner / 60000) % 60;
  durationInner -= m * 60000;
  const h = (durationInner / 3600000) % 24;
  durationInner -= h * 3600000;
  const d = durationInner / 86400000;

  return (d > 0 ? d + "." : "") +
    (h < 10 ? "0" + h : h) + ":" +
    (m < 10 ? "0" + m : m) + ":" +
    (s < 10 ? "0" + s : s) + "." +
    (ms < 10 ? "00" + ms : ms < 100 ? "0" + ms : ms);
};

const testOutcomeTable: {[outcome: string]: string} = {
  "failed": "Failed",
  "pending": "Skipped",
  "passed": "Passed"
};

const processor = (testRunResult: JestTestRunResult): void => {
  console.log("Generating TRX file...");
  const computerName = os.hostname();
  const userName = process.env.SUDO_USER ||
    process.env.LOGNAME ||
    process.env.USER ||
    process.env.LNAME ||
    process.env.USERNAME;

  // TestRun
  const resultBuilder = builder.create("TestRun", { version: "1.0", encoding: "UTF-8" })
    .att("id", uuid.v4())
    .att("name", `${userName}@${computerName} ${new Date(testRunResult.startTime).toISOString()}`)
    .att("runUser", userName)
    .att("xmlns", "http://microsoft.com/schemas/VisualStudio/TeamTest/2010");
  // TestSettings
  resultBuilder.ele("TestSettings")
    .att("name", "Jest test run")
    .att("id", uuid.v4());

  // Times
  const startTime = new Date(testRunResult.startTime).toISOString();
  resultBuilder.ele("Times")
    .att("creation", startTime)
    .att("queuing", startTime)
    .att("start", startTime);

  // ResultSummary
  const summary = resultBuilder.ele("ResultSummary")
    .att("outcome", testRunResult.success ? "Passed" : "Failed");
  summary.ele("Counters")
    .att("total", testRunResult.numTotalTests)
    .att("executed", testRunResult.numTotalTests - testRunResult.numPendingTests)
    .att("passed", testRunResult.numPassedTests)
    .att("failed", testRunResult.numFailedTests)
    .att("error", 0);

  // TestDefinitions
  const testDefinitions = resultBuilder.ele("TestDefinitions");
  const testLists = resultBuilder.ele("TestLists");
  testLists.ele("TestList")
    .att("name", "Results Not in a List")
    .att("id", testListNotInListId);
  testLists.ele("TestList")
    .att("name", "All Loaded Results")
    .att("id", testListAllLoadedResultsId);
  const testEntries = resultBuilder.ele("TestEntries");
  const results = resultBuilder.ele("Results");

  testRunResult.testResults.forEach(testSuiteResult => {
    const perTestDuration = getSuitePerTestDuration(testSuiteResult);
    const perTestDurationFormatted = formatDuration(perTestDuration);
    testSuiteResult.testResults.forEach((testResult, index) => {
      const testId = uuid.v4();
      const executionId = uuid.v4();
      const fullTestName = getFullTestName(testResult);
      // UnitTest
      const unitTest = testDefinitions.ele("UnitTest")
        .att("name", fullTestName)
        .att("id", testId);
      unitTest.ele("Execution")
        .att("id", executionId);
      unitTest.ele("TestMethod")
        .att("codeBase", `Jest_${fullTestName}`)
        .att("name", fullTestName)
        .att("className", getTestClassName(testResult));

      // TestEntry
      testEntries.ele("TestEntry")
        .att("testId", testId)
        .att("executionId", executionId)
        .att("testListId", testListNotInListId);

      // UnitTestResult
      const result = results.ele("UnitTestResult")
        .att("testId", testId)
        .att("executionId", executionId)
        .att("testName", fullTestName)
        .att("computerName", computerName)
        .att("duration", perTestDuration)
        .att("startTime", new Date(testSuiteResult.perfStats.start + index * perTestDuration).toISOString())
        .att("endTime", new Date(testSuiteResult.perfStats.start + (index + 1) * perTestDuration).toISOString())
        .att("testType", testType)
        .att("outcome", testOutcomeTable[testResult.status])
        .att("testListId", testListNotInListId);

      if (testResult.status === "failed") {
        result.ele("Output").ele("ErrorInfo").ele("Message", testResult.failureMessages.join("\n"));
      }
    });
  });

  const xml = resultBuilder.end({ pretty: true });
  // console.log(xml);
  writeFileSync("jest-test-results.trx", xml, { encoding: "utf8" });
  console.log("TRX file output to jest-test-results.trx");
};

export = processor;
