const isBuildIgnored = require('./isBuildIgnored.cjs')

module.exports = {
  ignore: {
    ignored: (p) => isBuildIgnored(p.fullpath()),
    childrenIgnored: (p) => isBuildIgnored(p.fullpath()),
  },
}
