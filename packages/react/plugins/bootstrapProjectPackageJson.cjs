const { toolchainManaged } = require('@jcoreio/toolchain/util/findUps.cjs')

module.exports = [
  async function bootstrapProjectPackageJson(packageJson) {
    const { devDependencies } = packageJson
    if (!devDependencies) return
    const globalJsdomVersion = (toolchainManaged.optionalDevDependencies || {})[
      'global-jsdom'
    ]
    if (devDependencies['jsdom-global'] && globalJsdomVersion) {
      devDependencies['global-jsdom'] = globalJsdomVersion
      delete devDependencies['jsdom-global']
    }
  },
]
