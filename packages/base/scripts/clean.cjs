const fs = require('../util/projectFs.cjs')

exports.run = async function clean() {
  await fs.remove('dist')
}
exports.description = 'remove build output'
