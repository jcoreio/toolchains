const { glob, globSync, globIterate, globIterateSync } = require('glob')
const { projectDir } = require('./findUps.cjs')

module.exports = {
  glob: (what, options) => glob(what, { cwd: projectDir, ...options }),
  globSync: (what, options) => globSync(what, { cwd: projectDir, ...options }),
  globIterate: (what, options) =>
    globIterate(what, { cwd: projectDir, ...options }),
  globIterateSync: (what, options) =>
    globIterateSync(what, { cwd: projectDir, ...options }),
}
