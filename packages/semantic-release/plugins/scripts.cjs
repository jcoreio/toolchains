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
          for (const key in packageJson.toolchainManaged
            .optionalDevDependencies)
            require(key)
        } catch (error) {
          await execa('pnpm', [
            'install',
            '-D',
            ...(isMonorepoRoot ? ['-w'] : []),
            ...Object.entries(
              packageJson.toolchainManaged.optionalDevDependencies
            ).map(([key, value]) => `${key}@${value}`),
          ])
        }
        await execa('semantic-release', args)
      },
    },
  },
]
