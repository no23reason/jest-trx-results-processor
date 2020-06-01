"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var os = __importStar(require("os"));
// Adapted from https://github.com/hatchteam/karma-trx-reporter
exports.formatDuration = function (duration) {
    var durationInner = duration || 0;
    var ms = durationInner % 1000;
    durationInner -= ms;
    var s = (durationInner / 1000) % 60;
    durationInner -= s * 1000;
    var m = (durationInner / 60000) % 60;
    durationInner -= m * 60000;
    var h = (durationInner / 3600000) % 24;
    durationInner -= h * 3600000;
    var d = durationInner / 86400000;
    return ((d > 0 ? d + "." : "") +
        (h < 10 ? "0" + h : h) +
        ":" +
        (m < 10 ? "0" + m : m) +
        ":" +
        (s < 10 ? "0" + s : s) +
        "." +
        (ms < 10 ? "00" + ms : ms < 100 ? "0" + ms : ms));
};
var sanitizationRegex = /[\u0000-\u0008\u000B-\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE-\uFFFF]/g;
exports.sanitizeString = function (str) {
    return str && str.replace(sanitizationRegex, "");
}; // removes the characters that make xmlbuilder throw
// Auxillary test data functions
exports.getFullTestName = function (testResult) {
    return testResult.ancestorTitles && testResult.ancestorTitles.length
        ? testResult.ancestorTitles.join(" / ") + " / " + testResult.title
        : testResult.title;
};
exports.getTestClassName = function (testResult) {
    return testResult.ancestorTitles && testResult.ancestorTitles.length
        ? testResult.ancestorTitles[0]
        : "No suite";
};
exports.getSuitePerTestDuration = function (testSuiteResult) {
    // take the total duration of suite and divide it by the number of tests
    // (Jest does not provide per test performance info)
    return Math.floor((testSuiteResult.perfStats.end - testSuiteResult.perfStats.start) /
        (testSuiteResult.numPassingTests +
            testSuiteResult.numFailingTests +
            testSuiteResult.numPendingTests));
};
exports.getEnvInfo = function (defaultUserName) {
    if (defaultUserName === void 0) { defaultUserName = "anonymous"; }
    return ({
        computerName: os.hostname(),
        userName: process.env.SUDO_USER ||
            process.env.LOGNAME ||
            process.env.USER ||
            process.env.LNAME ||
            process.env.USERNAME ||
            defaultUserName,
    });
};
