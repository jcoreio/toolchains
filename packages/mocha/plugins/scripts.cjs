const execa = require('@jcoreio/toolchain/util/execa.cjs')
const {
  toolchainPackages,
  toolchainConfig,
  isMonorepoRoot,
  monorepoSubpackageDirs,
  projectDir,
} = require('@jcoreio/toolchain/util/findUps.cjs')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const path = require('path')

const testScripts = Object.entries(toolchainConfig.scripts || {}).filter(
  ([name]) => /^test\W/.test(name)
)

const getFileArgs = async (args) =>
  (
    await Promise.all(
      args.map(async (arg) =>
        !arg.startsWith('-') && (await fs.pathExists(arg)) ? [arg] : []
      )
    )
  ).flat()

const makeScripts = ({
  suffix = '',
  env = process.env,
  descriptionSuffix = '',
} = {}) => ({
  [`coverage${suffix}`]: {
    description: `run all tests${descriptionSuffix} with code coverage`,
    run: async (args = []) => {
      await execa('nyc', ['tc', `test${suffix}`, ...args], {
        env: {
          ...env,
          JCOREIO_TOOLCHAIN_COVERAGE: '1',
        },
      })
    },
  },
  ...Object.fromEntries(
    testScripts.map(([name, value]) => [
      `coverage${name.substring(4)}${suffix}`,
      {
        description: `${
          typeof value.description === 'string' ?
            value.description
          : `run ${name}`
        }${descriptionSuffix} with code coverage`,
        run: async (args = []) => {
          await execa('nyc', ['tc', name, ...args], {
            env: {
              ...env,
              JCOREIO_TOOLCHAIN_COVERAGE: '1',
            },
          })
        },
      },
    ])
  ),
  [`test${suffix}`]: {
    description: `run all tests${descriptionSuffix}`,
    run: async (args = []) => {
      if (isMonorepoRoot) {
        const fileArgs = await getFileArgs(args)
        const subpackageDirs = new Set(
          fileArgs.map((file) =>
            monorepoSubpackageDirs.find(
              (dir) =>
                !path
                  .relative(
                    path.resolve(projectDir, dir),
                    path.resolve(projectDir, file)
                  )
                  .startsWith('.')
            )
          )
        )
        const subpackageDir =
          subpackageDirs.size === 1 ? [...subpackageDirs][0] : undefined

        if (subpackageDir) {
          await execa(
            'tc',
            [
              'test',
              ...args.map((arg) => {
                if (!fs.pathExistsSync(arg)) return arg
                return path.relative(
                  path.resolve(projectDir, subpackageDir),
                  path.resolve(projectDir, arg)
                )
              }),
            ],
            { env, cwd: subpackageDir }
          )
          return
        }
      }

      if (testScripts.length) {
        for (const [name] of testScripts) {
          await execa('tc', [name, ...args], { env })
        }
      } else {
        await execa('mocha', [...args], { env })
      }
    },
  },
})

module.exports = [makeScripts()]

if (
  toolchainConfig.outputEsm !== false &&
  toolchainPackages.includes('@jcoreio/toolchain-esnext')
) {
  module.exports = [
    {
      ...makeScripts({
        descriptionSuffix: ' in CJS mode',
        env: {
          ...process.env,
          JCOREIO_TOOLCHAIN_TEST: '1',
          JCOREIO_TOOLCHAIN_CJS: '1',
        },
      }),
      ...makeScripts({
        suffix: ':esm',
        descriptionSuffix: ' in ESM mode',
        env: {
          ...process.env,
          JCOREIO_TOOLCHAIN_TEST: '1',
          JCOREIO_TOOLCHAIN_ESM: '1',
        },
      }),
    },
  ]
}
