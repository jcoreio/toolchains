const execa = require('@jcoreio/toolchain/util/execa.cjs')

module.exports = [
  {
    coverage: {
      description: 'run tests with code coverage',
      run: async (args = []) => {
        await execa('nyc', ['mocha', ...args])
      },
    },
    test: {
      description: 'run tests',
      run: async (args = []) => {
        await execa('mocha', [...args])
      },
    },
  },
]
