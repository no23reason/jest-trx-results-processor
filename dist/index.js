"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var mkdirp_1 = __importDefault(require("mkdirp"));
var path_1 = __importDefault(require("path"));
var constants_1 = require("./constants");
var trx_generator_1 = require("./trx-generator");
var TrxReporter = /** @class */ (function () {
    function TrxReporter(_, options) {
        var _this = this;
        var _a, _b, _c, _d;
        this.onRunComplete = function (_, aggregatedResults) {
            var trx = trx_generator_1.generateTrx(aggregatedResults, _this.options);
            var targetDir = path_1.default.dirname(path_1.default.resolve(_this.options.outputFile));
            mkdirp_1.default.sync(targetDir);
            fs_1.writeFileSync(_this.options.outputFile, trx, { encoding: "utf8" });
            process.stdout.write("DONE\n");
            process.stdout.write("TRX file output to '" + _this.options.outputFile + "'\n");
        };
        this.options = __assign(__assign({}, options), { defaultUserName: (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.defaultUserName, (_b !== null && _b !== void 0 ? _b : constants_1.defaultUserName)), outputFile: (_d = (_c = options) === null || _c === void 0 ? void 0 : _c.outputFile, (_d !== null && _d !== void 0 ? _d : constants_1.defaultOutputFile)) });
    }
    return TrxReporter;
}());
module.exports = TrxReporter;
