/* eslint-env node, es2018 */
const execa = require('@jcoreio/toolchain/util/execa.cjs')

module.exports = {
  scripts: {
    'test:unit': {
      description: 'run unit tests',
      run: (args = []) =>
        execa('mocha', ['--config', '.mocharc-unit.cjs', ...args], {
          env: { ...process.env, JCOREIO_TOOLCHAIN_SELF_TEST: '1' },
        }),
    },
    'test:integration': {
      description: 'run integration tests',
      run: (args = []) =>
        execa('mocha', ['--config', '.mocharc-integration.cjs', ...args]),
    },
  },
}
