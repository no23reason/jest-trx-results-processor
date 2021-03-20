import type { Config } from "@jest/types";
import * as path from "path";
import NodeEnvironment from "jest-environment-node";
import { getFullTestName } from "./utils";

type AttachmentPaths = string[];
type TestRunMapping = { [runStartTime: number]: AttachmentPaths };
type TestAttachmentMapping = { [testname: string]: TestRunMapping };
type TestFileInfo = { [filename: string]: TestAttachmentMapping };

export default class TrxAttachmentNodeEnvironment extends NodeEnvironment {
  static fileAttachmentInfoList: TestFileInfo = {};

  testAttachmentMappings: TestAttachmentMapping;

  constructor(config: Config.ProjectConfig, context: any) {
    super(config);

    const testFilePath = path.relative("./", context.testPath);

    this.testAttachmentMappings = TrxAttachmentNodeEnvironment.fileAttachmentInfoList[testFilePath];
    if (this.testAttachmentMappings) {
      TrxAttachmentNodeEnvironment.fileAttachmentInfoList[testFilePath] = {};
      this.testAttachmentMappings = TrxAttachmentNodeEnvironment.fileAttachmentInfoList[testFilePath];
    }
  }

  async handleTestEvent(event: any) {
    if (event.name === 'test_start') {
      const ancestorTitles = [];

      // Test name in reporter has describe tags splitting in the name
      let describeNode = event.test.parent;
      while (describeNode.parent) {
        ancestorTitles.unshift(describeNode.name);
      }

      const testName = getFullTestName(ancestorTitles, event.test.name);
      if (!this.testAttachmentMappings[testName]) {
        this.testAttachmentMappings[testName] = {};
      }

      const attachmentList: string[] = [];

      // TODO: use event.test.startedAt in case of re-reuns
      this.testAttachmentMappings[testName][0] = attachmentList;

      this.global.saveAttachmentToTrx = (attachmentPath: string) => {
        attachmentList.push(attachmentPath);
      }
    }
  }
}
