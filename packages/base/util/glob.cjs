const _glob = require('util').promisify(require('glob'))
const { projectDir } = require('./findUps.cjs')

const glob = (what, options) => _glob(what, { cwd: projectDir, ...options })

module.exports = glob
