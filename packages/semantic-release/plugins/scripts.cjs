const execa = require('@jcoreio/toolchain/util/execa.cjs')
const {
  packageJson,
  isMonorepoRoot,
} = require('@jcoreio/toolchain/util/findUps.cjs')
const resolveBin = require('resolve-bin')
const ownPackageJson = require('../package.json')

module.exports = [
  {
    release: {
      description: 'run automated release',
      run: async (args = []) => {
        if (isMonorepoRoot && packageJson.name !== '@jcoreio/toolchains') {
          await execa('pnpm', [
            'run',
            '-r',
            '--workspace-concurrency=1',
            'tc',
            'release',
            '--if-command-exists',
          ])
        } else {
          try {
            resolveBin.sync('semantic-release')
            for (const key in ownPackageJson.toolchainManaged
              .optionalDevDependencies)
              require(key)
            // eslint-disable-next-line no-unused-vars
          } catch (error) {
            await execa('pnpm', [
              'install',
              '-D',
              ...(isMonorepoRoot ? ['-w'] : []),
              ...Object.entries(
                ownPackageJson.toolchainManaged.optionalDevDependencies
              ).map(([key, value]) => `${key}@${value}`),
            ])
          }
          await execa('semantic-release', args)
        }
      },
    },
  },
]
