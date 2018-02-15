export type Epoch = number;

export type SnapshotTestRunStats = {
  added: number;
  didUpdate: boolean;
  failure: boolean;
  filesAdded: number;
  filesRemoved: number;
  filesUnmatched: number;
  filesUpdated: number;
  matched: number;
  total: number;
  unchecked: number;
  unmatched: number;
  updated: number;
};

export type SnapshotTestStats = {
  added: number;
  fileDeleted: boolean;
  matched: number;
  unchecked: number;
  unmatched: number;
  updated: number;
};

export type JestTestResult = {
  /**
   * Array of messages in the 'describe' blocks surrounding the test.
   *
   * @type {string[]}
   */
  ancestorTitles: string[];
  /**
   * Duration of the test.
   *
   * @type {number}
   */
  duration?: number;
  /**
   * Array of error messages.
   *
   * @type {string[]}
   */
  failureMessages: string[];
  /**
   * Full name of the test.
   *
   * @type {string}
   */
  fullName?: string;
  /**
   * Total number of asserts that are passing.
   *
   * @type {number}
   */
  numPassingAsserts: number;
  /**
   * Status of the test.
   *
   * @type {("failed" | "pending" | "passed")}
   */
  status: "failed" | "pending" | "passed";
  /**
   * Message in the 'it' block.
   *
   * @type {string}
   */
  title: string;
};

export type JestTestSuiteResult = {
  /**
   * Test coverage information.
   *
   * @type {{}}
   */
  coverage?: {};
  /**
   * Number of failing tests in the suite.
   *
   * @type {number}
   */
  numFailingTests: number;
  /**
   * Number of passing tests in the suite.
   *
   * @type {number}
   */
  numPassingTests: number;
  /**
   * Number of pending tests in the suite.
   *
   * @type {number}
   */
  numPendingTests: number;
  /**
   * Performance information.
   *
   * @type {{
   *     start: Epoch;
   *     end: Epoch;
   *   }}
   */
  perfStats: {
    /**
     * Unix timestamp of the test suite run start.
     *
     * @type {Epoch}
     */
    start: Epoch;
    /**
     * Unix timestamp of the test suite run end.
     *
     * @type {Epoch}
     */
    end: Epoch;
  };
  /**
   * Statistics of snapshots created, modified, etc.
   *
   * @type {SnapshotTestStats}
   */
  snapshot?: SnapshotTestStats;
  /**
   * Test source map information.
   *
   * @type {{}}
   */
  sourceMaps?: {};
  /**
   * Flag indicating the test was skipped.
   *
   * @type {SnapshotTestStats}
   */
  skipped?: boolean;
  /**
   * Absolute path to the test file.
   *
   * @type {string}
   */
  testFilePath: string;
  /**
   * Results of the individual tests.
   *
   * @type {JestTestResult[]}
   */
  testResults: JestTestResult[];
};

export type JestTestRunResult = {
  /**
   * True if all the tests are passing.
   *
   * @type {boolean}
   */
  success: boolean;
  /**
   * Unix timestamp of the test run start.
   *
   * @type {Epoch}
   */
  startTime: Epoch;
  /**
   * Total number of test suites.
   *
   * @type {number}
   */
  numTotalTestSuites: number;
  /**
   * Number of test suites that have all the tests passing.
   *
   * @type {number}
   */
  numPassedTestSuites: number;
  /**
   * Number of test suites that have at least one failing test.
   *
   * @type {number}
   */
  numFailedTestSuites: number;
  /**
   * Number of test suites that have at least one pending test.
   *
   * @type {number}
   */
  numPendingTestSuites: number;
  /**
   * Number of test suites that ended with a runtime error.
   *
   * @type {number}
   */
  numRuntimeErrorTestSuites: number;
  /**
   * Total number of tests across all the test suites.
   *
   * @type {number}
   */
  numTotalTests: number;
  /**
   * Number of passing tests across all the test suites.
   *
   * @type {number}
   */
  numPassedTests: number;
  /**
   * Number of failing tests across all the test suites.
   *
   * @type {number}
   */
  numFailedTests: number;
  /**
   * Number of pending tests across all the test suites.
   *
   * @type {number}
   */
  numPendingTests: number;
  /**
   * Statistics of snapshots created, modified, etc.
   *
   * @type {SnapshotTestRunStats}
   */
  snapshot?: SnapshotTestRunStats;
  /**
   * Results of individual test suites.
   *
   * @type {JestTestSuiteResult[]}
   */
  testResults: JestTestSuiteResult[];
  /**
   * Flag indicating the test run was forcibly terminated.
   *
   * @type {boolean}
   */
  wasInterrupted?: boolean;
};
