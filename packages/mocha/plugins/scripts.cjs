const execa = require('@jcoreio/toolchain/util/execa.cjs')
const { toolchainConfig } = require('@jcoreio/toolchain/util/findUps.cjs')

const testScripts = Object.entries(toolchainConfig.scripts || {}).filter(
  ([name]) => /^test\W/.test(name)
)

module.exports = [
  {
    coverage: {
      description: `run ${
        testScripts.length ? 'all tests' : 'tests'
      } with code coverage`,
      run: async (args = []) => {
        await execa('nyc', ['tc', 'test', ...args])
      },
    },
    ...Object.fromEntries(
      testScripts.map(([name, value]) => [
        `coverage${name.substring(4)}`,
        {
          description: `${
            typeof value.description === 'string'
              ? value.description
              : `run ${name}`
          } with code coverage`,
          run: async (args = []) => {
            await execa('nyc', ['tc', name, ...args])
          },
        },
      ])
    ),
    test: {
      description: `run ${testScripts.length ? 'all tests' : 'tests'}`,
      run: async (args = []) => {
        if (testScripts.length) {
          for (const [name] of testScripts) {
            await execa('tc', [name, ...args])
          }
        } else {
          await execa('mocha', [...args])
        }
      },
    },
  },
]
