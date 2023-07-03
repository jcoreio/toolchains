const execa = require('@jcoreio/toolchain/util/execa.cjs')

module.exports = [
  {
    release: {
      description: 'run automated release',
      run: async (args = []) => {
        await execa('semantic-release', args)
      },
    },
  },
]
