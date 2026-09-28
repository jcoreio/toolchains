/* eslint-env node, es2018 */
const execa = require('@jcoreio/toolchain/util/execa.cjs')
const {
  monorepoSubpackageDirs,
} = require('@jcoreio/toolchain/util/findUps.cjs')
const publishRelease = require('@jcoreio/toolchain-semantic-release/util/publishRelease.cjs')

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
    'publish-release': {
      description: 'publish package (meant to be called from release script)',
      run: async ([nextVersion] = []) => {
        for (const cwd of monorepoSubpackageDirs) {
          await publishRelease({ cwd, nextVersion })
        }
      },
    },
  },
}
