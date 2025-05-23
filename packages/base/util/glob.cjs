const { glob, globSync, globIterate, globIterateSync } = require('glob')
const { projectDir } = require('./findUps.cjs')

const extendOptions = (options) => ({
  cwd: projectDir,
  ...options,
  ignore:
    (
      options &&
      options.ignore &&
      !Array.isArray(options.ignore) &&
      typeof options.ignore !== 'string'
    ) ?
      {
        ignored: (p) =>
          !/\/node_modules\/|\\node_modules\\/.test(p.fullpath()) &&
          (!options.ignore.ignored || options.ignore.ignored(p)),
        childrenIgnored: (p) =>
          !/\/node_modules\/|\\node_modules\\/.test(p.fullpath()) &&
          (!options.ignore.childrenIgnored ||
            options.ignore.childrenIgnored(p)),
      }
    : [
        ...((options && options.ignore ?
          Array.isArray(options.ignore) ?
            options.ignore
          : [options.ignore]
        : []) || []),
        '**/node_modules/**',
      ],
})

module.exports = {
  glob: (what, options) => glob(what, extendOptions(options)),
  globSync: (what, options) => globSync(what, extendOptions(options)),
  globIterate: (what, options) => globIterate(what, extendOptions(options)),
  globIterateSync: (what, options) =>
    globIterateSync(what, extendOptions(options)),
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
