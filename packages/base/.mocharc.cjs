module.exports = {
  require: [require.resolve('./util/configureMocha.cjs')],
  reporter: 'spec',
  spec: [
    require.resolve('./util/mochaWatchClearConsole.cjs'),
    'test/**.{js,cjs,mjs}',
  ],
}
