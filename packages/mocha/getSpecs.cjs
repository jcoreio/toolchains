const cliSpecs = require('./cliSpecs.cjs')

module.exports = function getSpecs(defaultSpecs) {
  return [
    require.resolve('./util/mochaWatchClearConsole.cjs'),
    ...(cliSpecs.length ? cliSpecs : defaultSpecs),
  ]
}
