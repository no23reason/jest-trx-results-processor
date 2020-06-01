"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = __importStar(require("path"));
var uuid = __importStar(require("uuid"));
var xmlbuilder_1 = require("xmlbuilder");
var constants_1 = require("./constants");
var utils_1 = require("./utils");
var renderTestRun = function (builder, testRunResult, computerName, userName) {
    return builder
        .att("id", uuid.v4())
        .att("name", userName + "@" + computerName + " " + new Date(testRunResult.startTime).toISOString())
        .att("runUser", userName)
        .att("xmlns", "http://microsoft.com/schemas/VisualStudio/TeamTest/2010");
};
var renderTestSettings = function (parentNode) {
    return parentNode
        .ele("TestSettings")
        .att("name", "Jest test run")
        .att("id", uuid.v4());
};
var renderTimes = function (parentNode, testRunResult) {
    var startTime = new Date(testRunResult.startTime).toISOString();
    parentNode
        .ele("Times")
        .att("creation", startTime)
        .att("queuing", startTime)
        .att("start", startTime)
        .att("finish", startTime);
};
var renderResultSummary = function (parentNode, testRunResult) {
    // workaround for https://github.com/facebook/jest/issues/6924
    var anyTestFailures = !(testRunResult.numFailedTests === 0 &&
        testRunResult.numRuntimeErrorTestSuites === 0);
    var isSuccess = !(anyTestFailures || testRunResult.snapshot.failure);
    var summary = parentNode
        .ele("ResultSummary")
        .att("outcome", isSuccess ? "Passed" : "Failed");
    summary
        .ele("Counters")
        .att("total", testRunResult.numTotalTests + testRunResult.numRuntimeErrorTestSuites)
        .att("executed", testRunResult.numTotalTests - testRunResult.numPendingTests)
        .att("passed", testRunResult.numPassedTests)
        .att("failed", testRunResult.numFailedTests)
        .att("error", testRunResult.numRuntimeErrorTestSuites);
};
var renderTestLists = function (parentNode) {
    var testLists = parentNode.ele("TestLists");
    testLists
        .ele("TestList")
        .att("name", "Results Not in a List")
        .att("id", constants_1.testListNotInListId);
    testLists
        .ele("TestList")
        .att("name", "All Loaded Results")
        .att("id", constants_1.testListAllLoadedResultsId);
};
var renderTestSuiteResult = function (testSuiteResult, testDefinitionsNode, testEntriesNode, resultsNode, computerName, postProcessTestResult) {
    var perTestDuration = utils_1.getSuitePerTestDuration(testSuiteResult);
    var perTestDurationFormatted = utils_1.formatDuration(perTestDuration);
    if (testSuiteResult.testResults && testSuiteResult.testResults.length) {
        testSuiteResult.testResults.forEach(function (testResult, index) {
            var testId = uuid.v4();
            var executionId = uuid.v4();
            var fullTestName = utils_1.getFullTestName(testResult);
            var fullTestPath = path.basename(testSuiteResult.testFilePath);
            // UnitTest
            var unitTest = testDefinitionsNode
                .ele("UnitTest")
                .att("name", fullTestName)
                .att("id", testId);
            unitTest.ele("Execution").att("id", executionId);
            unitTest
                .ele("TestMethod")
                .att("codeBase", "Jest_" + fullTestPath)
                .att("name", fullTestName)
                .att("className", utils_1.getTestClassName(testResult));
            // TestEntry
            testEntriesNode
                .ele("TestEntry")
                .att("testId", testId)
                .att("executionId", executionId)
                .att("testListId", constants_1.testListNotInListId);
            // UnitTestResult
            var result = resultsNode
                .ele("UnitTestResult")
                .att("testId", testId)
                .att("executionId", executionId)
                .att("testName", fullTestName)
                .att("computerName", computerName)
                .att("duration", perTestDurationFormatted)
                .att("startTime", new Date(testSuiteResult.perfStats.start + index * perTestDuration).toISOString())
                .att("endTime", new Date(testSuiteResult.perfStats.start + (index + 1) * perTestDuration).toISOString())
                .att("testType", constants_1.testType)
                .att("outcome", constants_1.testOutcomeTable[testResult.status])
                .att("testListId", constants_1.testListNotInListId);
            if (testResult.status === "failed") {
                result
                    .ele("Output")
                    .ele("ErrorInfo")
                    .ele("Message", utils_1.sanitizeString(testResult.failureMessages.join("\n")));
            }
            // Perform any post processing for this test result.
            if (postProcessTestResult) {
                postProcessTestResult.forEach(function (postProcess) {
                    return postProcess(testSuiteResult, testResult, result);
                });
            }
        });
    }
    else if (testSuiteResult.failureMessage) {
        // For suites that failed to run, we will generate a test result that documents the failure.
        // This occurs when there is a failure compiling/loading the suite, not when a test in the suite fails.
        var testId = uuid.v4();
        var executionId = uuid.v4();
        var fullTestName = path.basename(testSuiteResult.testFilePath);
        var time = new Date().toISOString();
        // Failed TestSuite
        var unitTest = testDefinitionsNode
            .ele("UnitTest")
            .att("name", fullTestName)
            .att("id", testId);
        unitTest.ele("Execution").att("id", executionId);
        unitTest
            .ele("TestMethod")
            .att("codeBase", "Jest_" + fullTestName)
            .att("name", fullTestName)
            .att("className", fullTestName);
        // TestEntry
        testEntriesNode
            .ele("TestEntry")
            .att("testId", testId)
            .att("executionId", executionId)
            .att("testListId", constants_1.testListNotInListId);
        // UnitTestResult
        var result = resultsNode
            .ele("UnitTestResult")
            .att("testId", testId)
            .att("executionId", executionId)
            .att("testName", fullTestName)
            .att("computerName", computerName)
            .att("duration", "0")
            .att("startTime", time)
            .att("endTime", time)
            .att("testType", constants_1.testType)
            .att("outcome", constants_1.testOutcomeTable.failed)
            .att("testListId", constants_1.testListNotInListId);
        result
            .ele("Output")
            .ele("ErrorInfo")
            .ele("Message", utils_1.sanitizeString(testSuiteResult.failureMessage));
    }
};
exports.generateTrx = function (testRunResult, options) {
    var _a = utils_1.getEnvInfo(options && options.defaultUserName), computerName = _a.computerName, userName = _a.userName;
    var resultBuilder = xmlbuilder_1.create("TestRun", {
        version: "1.0",
        encoding: "UTF-8",
    });
    renderTestRun(resultBuilder, testRunResult, computerName, userName);
    renderTestSettings(resultBuilder);
    renderTimes(resultBuilder, testRunResult);
    renderResultSummary(resultBuilder, testRunResult);
    var testDefinitions = resultBuilder.ele("TestDefinitions");
    renderTestLists(resultBuilder);
    var testEntries = resultBuilder.ele("TestEntries");
    var results = resultBuilder.ele("Results");
    testRunResult.testResults.forEach(function (testSuiteResult) {
        return renderTestSuiteResult(testSuiteResult, testDefinitions, testEntries, results, computerName, options && options.postProcessTestResult);
    });
    return resultBuilder.end({ pretty: true });
};
