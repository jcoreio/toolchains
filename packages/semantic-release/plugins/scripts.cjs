const execa = require('@jcoreio/toolchain/util/execa.cjs')
const {
  projectDir,
  packageJson,
  isMonorepoRoot,
} = require('@jcoreio/toolchain/util/findUps.cjs')
const resolveBin = require('resolve-bin')
const ownPackageJson = require('../package.json')
const publishRelease = require('../util/publishRelease.cjs')
const path = require('path')

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
            await execa(
              'pnpm',
              [
                'install',
                '-D',
                ...(isMonorepoRoot ? ['-w'] : []),
                ...Object.entries(
                  ownPackageJson.toolchainManaged.optionalDevDependencies
                ).map(([key, value]) => `${key}@${value}`),
              ],
              {
                env:
                  process.env.NPM_TOKEN ?
                    {
                      ...process.env,
                      'npm_config_//registry.npmjs.org/:_authToken':
                        process.env.NPM_TOKEN,
                    }
                  : process.env,
              }
            )
          }
          await execa('semantic-release', args)
        }
      },
    },
    ...(!isMonorepoRoot && {
      'publish-release': {
        description: 'publish package (meant to be called from release script)',
        run: async ([nextVersion] = []) => {
          await publishRelease({
            cwd: path.join(projectDir, 'dist'),
            nextVersion,
          })
        },
      },
    }),
  },
]
