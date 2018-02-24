import * as os from "os";

import { JestTestResult, JestTestSuiteResult } from "./types";

// Adapted from https://github.com/hatchteam/karma-trx-reporter
export const formatDuration = (duration: number): string => {
  let durationInner = duration || 0;
  const ms = durationInner % 1000;
  durationInner -= ms;
  const s = (durationInner / 1000) % 60;
  durationInner -= s * 1000;
  const m = (durationInner / 60000) % 60;
  durationInner -= m * 60000;
  const h = (durationInner / 3600000) % 24;
  durationInner -= h * 3600000;
  const d = durationInner / 86400000;

  return (
    (d > 0 ? d + "." : "") +
    (h < 10 ? "0" + h : h) +
    ":" +
    (m < 10 ? "0" + m : m) +
    ":" +
    (s < 10 ? "0" + s : s) +
    "." +
    (ms < 10 ? "00" + ms : ms < 100 ? "0" + ms : ms)
  );
};

const sanitizationRegex = /[\u0000-\u0008\u000B-\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE-\uFFFF]/g;
export const sanitizeString = (str: string): string =>
  str && str.replace(sanitizationRegex, ""); // removes the characters that make xmlbuilder throw

// Auxilliary test data functions
export const getFullTestName = (testResult: JestTestResult): string =>
  testResult.ancestorTitles && testResult.ancestorTitles.length
    ? `${testResult.ancestorTitles.join(" / ")} / ${testResult.title}`
    : testResult.title;

export const getTestClassName = (testResult: JestTestResult): string =>
  testResult.ancestorTitles && testResult.ancestorTitles.length
    ? testResult.ancestorTitles[0]
    : "No suite";

export const getSuitePerTestDuration = (
  testSuiteResult: JestTestSuiteResult,
): number =>
  // take the total duration of suite and divide it by the number of tests
  // (Jest does not provide per test performance info)
  Math.floor(
    (testSuiteResult.perfStats.end - testSuiteResult.perfStats.start) /
      (testSuiteResult.numPassingTests +
        testSuiteResult.numFailingTests +
        testSuiteResult.numPendingTests),
  );

export const getEnvInfo = () => ({
  computerName: os.hostname(),
  userName:
    process.env.SUDO_USER ||
    process.env.LOGNAME ||
    process.env.USER ||
    process.env.LNAME ||
    process.env.USERNAME,
});
