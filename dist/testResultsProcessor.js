"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var fs_1 = require("fs");
var mkdirp_1 = __importDefault(require("mkdirp"));
var path_1 = __importDefault(require("path"));
var constants_1 = require("./constants");
var trx_generator_1 = require("./trx-generator");
var processor = function (options) {
    if (options === void 0) { options = {
        outputFile: constants_1.defaultOutputFile,
        defaultUserName: constants_1.defaultUserName,
    }; }
    return function (testRunResult) {
        process.stdout.write("Generating TRX file...");
        var trx = trx_generator_1.generateTrx(testRunResult, options);
        var targetDir = path_1.default.dirname(path_1.default.resolve(options.outputFile));
        mkdirp_1.default.sync(targetDir);
        fs_1.writeFileSync(options.outputFile, trx, { encoding: "utf8" });
        process.stdout.write("DONE\n");
        process.stdout.write("TRX file output to '" + options.outputFile + "'\n");
        // Return the input testRunResult to allow for chaining other result processors
        return testRunResult;
    };
};
module.exports = processor;
