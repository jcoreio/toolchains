const execa = require('@jcoreio/toolchain/util/execa.cjs')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const deploy = require('../scripts/deploy.cjs')

module.exports = [
  {
    predeploy: {
      description: 'prepare to deploy lambda function',
      run: async (args = []) => {
        await execa('tc', ['build'])
        await fs.ensureSymlink('node_modules', 'dist/node_modules', 'dir')
      },
    },
    deploy: {
      description: 'deploy lambda function to AWS',
      run: deploy,
    },
  },
]
