const { glob, globSync, globIterate, globIterateSync } = require('glob')
const { projectDir } = require('./findUps.cjs')

module.exports = {
  glob: (what, options) => glob(what, { cwd: projectDir, ...options }),
  globSync: (what, options) => globSync(what, { cwd: projectDir, ...options }),
  globIterate: (what, options) =>
    globIterate(what, { cwd: projectDir, ...options }),
  globIterateSync: (what, options) =>
    globIterateSync(what, { cwd: projectDir, ...options }),
  globExists: async (what, options) => {
    for await (const _ of module.exports.globIterate(what, options)) {
      return true
    }
    return false
  },
  globExistsSync: (what, options) => {
    for (const _ of module.exports.globIterateSync(what, options)) {
      return true
    }
    return false
  },
}
