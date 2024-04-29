const execa = require('@jcoreio/toolchain/util/execa.cjs')
const { isMonorepoRoot } = require('@jcoreio/toolchain/util/findUps.cjs')
const resolveBin = require('resolve-bin')
const packageJson = require('../package.json')

module.exports = [
  {
    release: {
      description: 'run automated release',
      run: async (args = []) => {
        try {
          resolveBin.sync('semantic-release')
          for (const key in packageJson.optionalDependencies) require(key)
        } catch (error) {
          await execa('pnpm', [
            'install',
            '-D',
            ...(isMonorepoRoot ? ['-w'] : []),
            ...Object.entries(packageJson.optionalDependencies).map(
              ([key, value]) => `${key}@${value}`
            ),
          ])
        }
        await execa('semantic-release', args)
      },
    },
  },
]
