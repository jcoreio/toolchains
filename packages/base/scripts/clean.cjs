const fs = require('../util/projectFs.cjs')

exports.run = async function clean() {
  await fs.emptyDir('dist').catch((err) => {
    if (err.code !== 'ENOENT') throw err
  })
}
exports.description = 'remove build output'
