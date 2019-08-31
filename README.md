[![build status](https://secure.travis-ci.org/no23reason/jest-trx-results-processor.svg)](http://travis-ci.org/no23reason/jest-trx-results-processor)
[![npm version](https://img.shields.io/npm/v/jest-trx-results-processor.svg)](https://www.npmjs.com/package/jest-trx-results-processor)
[![Dependency Status](https://david-dm.org/no23reason/jest-trx-results-processor.svg)](https://david-dm.org/no23reason/jest-trx-results-processor)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

# jest-trx-results-processor

This package is used to export a TRX file from [Jest](https://facebook.github.io/jest/) test runs to be used in [Visual Studio](https://www.visualstudio.com/) and [Visual Studio Team Services](https://www.visualstudio.com/vsts-test/).

## Migration from 0.x

Version 1.0.0 was rewritten to use reporters API. Either use that (see [Usage](#usage)), or update the require path in your configuration (see [Usage as testResultsProcessor](#usage-as-test-results-processor)).

## Installation

```
yarn add --dev jest-trx-results-processor
```

## Usage

In your jest config add the following entry:

```json
{
  "reporters": ["default", "jest-trx-results-processor"]
}
```

You can also pass additional arguments:

```json
{
  "reporters": [
    "default",
    [
      "jest-trx-results-processor",
      {
        "outputFile": "relative/path/to/resulting.trx", // defaults to "test-results.trx"
        "defaultUserName": "user name to use if automatic detection fails" // defaults to "anonymous"
      }
    ]
  ]
}
```

Then run jest as usual.

## Usage as testResultsProcessor

_Notice: this method of use will be removed in the next major version. PLease use the reporters API described above._

Create a `jestTrxProcessor.js` file somewhere in your project (for this example I'll assume the `scripts` folder).
There you can configure the processor, as Jest does not allow you to pass custom parameters to the results processor:

```js
// for jest-trx-results-processor >= 1.0.0
var builder = require("jest-trx-results-processor/dist/testResultsProcessor"); // only this has changed since v 0.x
// for jest-trx-results-processor < 1.0.0
var builder = require("jest-trx-results-processor");

var processor = builder({
  outputFile: "relative/path/to/resulting.trx", // this defaults to "test-results.trx"
  defaultUserName: "user name to use if automatic detection fails", // this defaults to "anonymous"
});

module.exports = processor;
```

Finally, point Jest to your results processor in the `package.json`:

```json
{
  "devDependencies": {
    "jest": "^19.0.0",
    "jest-trx-results-processor": "~0.0.5"
  },
  "jest": {
    "testResultsProcessor": "./scripts/jestTrxProcessor"
  }
}
```

Then you just run Jest as you normally would.

Minimal working configuration can be seen in the [examples folder](https://github.com/no23reason/jest-trx-results-processor/tree/master/examples).

## Acknowledgements

This tool is heavily inspired by [karma-trx-reporter](https://github.com/hatchteam/karma-trx-reporter) and [jest-junit](https://github.com/jest-community/jest-junit).

## License

_jest-trx-results-processor_ is available under MIT. See [LICENSE](https://github.com/no23reason/jest-trx-results-processor/tree/master/LICENSE) for more details.
