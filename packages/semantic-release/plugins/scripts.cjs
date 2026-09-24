const execa = require('@jcoreio/toolchain/util/execa.cjs')
const {
  packageJson,
  isMonorepoRoot,
} = require('@jcoreio/toolchain/util/findUps.cjs')
const resolveBin = require('resolve-bin')
const ownPackageJson = require('../package.json')
const semver = require('semver')
const JWT = require('jsonwebtoken')

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
    'publish-release': {
      description: 'publish package (meant to be called from release script)',
      run: async ([nextVersion] = []) => {
        if (!semver.valid(nextVersion)) {
          // eslint-disable-next-line no-console
          console.error('Usage: tc publish <version>')
          process.exit(1)
        }
        await execa('npm', ['version', nextVersion], { cwd: 'dist' })
        const env = { ...process.env }
        if (process.env.CIRCLECI === 'true') {
          env.NPM_ID_TOKEN = (
            await execa(
              'circleci',
              [
                'run',
                'oidc',
                'get',
                '--claims',
                '{"aud": "npm:registry.npmjs.org"}',
              ],
              { stdio: ['inherit', 'pipe', 'inherit'], encoding: 'utf8' }
            )
          ).stdout.trim()
          env.NPM_TOKEN = ''
          env['npm_config_//registry.npmjs.org/:_authToken'] = ''

          const decoded = JWT.decode(env.NPM_ID_TOKEN)
          // eslint-disable-next-line no-console
          console.error('NPM_ID_TOKEN token claims:', decoded)
        }
        try {
          await execa('npm', ['publish', '.', '--loglevel', 'silly'], {
            cwd: 'dist',
            env,
          })
        } catch {
          await execa('git', ['tag', '-d', `v${nextVersion}`], {
            cwd: 'dist',
            env,
          })
          await execa(
            'git',
            ['push', '--delete', 'origin', `v${nextVersion}`],
            {
              cwd: 'dist',
              env,
            }
          )
          process.exit(1)
        }
      },
    },
  },
]
