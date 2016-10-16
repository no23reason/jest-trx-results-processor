var builder = require('jest-trx-results-processor');

var processor = builder({
    outputFile: 'relative/path/to/resulting.trx'
});

module.exports = processor;
