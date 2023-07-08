const execa = require('@jcoreio/toolchain/util/execa.cjs')
const { packageJson } = require('@jcoreio/toolchain/util/findUps.cjs')

module.exports = [
  {
    'ci:browse': {
      description: 'open CircleCI page in browser',
      run: async (args = []) => {
        const url = (
          packageJson.repository.url ||
          (await execa('git', ['remote', 'get-url', 'origin']))
        )
          .replace('https://github.com/', '')
          .replace(/\.git$/, '')
        await execa('open', [`https://circleci.com/gh/${url}`])
      },
    },
  },
]
