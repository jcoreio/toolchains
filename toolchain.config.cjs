/* eslint-env node, es2018 */

const execa = require('@jcoreio/toolchain/util/execa.cjs')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const path = require('path')
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
          const packageJsonFile = path.join(cwd, 'package.json')
          const packageJson = await fs.readJson(packageJsonFile)
          const { dependencies } = packageJson
          let changed = false
          if (dependencies) {
            for (const pkg in dependencies) {
              if (dependencies[pkg] === 'workspace:*') {
                dependencies[pkg] = nextVersion
                changed = true
              }
            }
          }
          if (changed) {
            await fs.writeJson(packageJsonFile, packageJson, { spaces: 2 })
          }
          await publishRelease({ cwd, nextVersion, gitTag: `v${nextVersion}` })
        }
      },
    },
  },
}
