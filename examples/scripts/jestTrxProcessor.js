var builder = require('jest-trx-results-processor');

var processor = builder({
    outputFile: 'configurable.trx'
});

module.exports = processor;
