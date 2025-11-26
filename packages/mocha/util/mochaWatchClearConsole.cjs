/* global before */
// avoid importing before from mocha because it may not be the same instance of
// Mocha as the project has.

if (process.argv.indexOf('--watch') >= 0) {
  before(() => process.stdout.write('\u001b[2J\u001b[1;1H\u001b[3J'))
}
