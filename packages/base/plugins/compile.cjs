const Path = require('path')
const { projectDir } = require('../util/findUps.cjs')
const fs = require('../util/projectFs.cjs')

module.exports = [
  async function compile(args = []) {
    const ignoreEnoent = (err) => {
      if (err.code !== 'ENOENT') throw err
    }
    const filter = (src, dest) => {
      // eslint-disable-next-line no-console
      console.error(
        Path.relative(projectDir, src),
        '->',
        Path.relative(projectDir, dest)
      )
      return true
    }
    await fs.copy('src', 'dist', { filter }).catch(ignoreEnoent)
  },
]
