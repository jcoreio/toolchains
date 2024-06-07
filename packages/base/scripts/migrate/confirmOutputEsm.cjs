const once = require('../../util/once.cjs')
const confirm = require('../../util/confirm.cjs')
const {
  toolchainConfig,
  toolchainConfigDeclared,
} = require('../../util/findUps.cjs')

module.exports = once(async () => {
  if (toolchainConfig && toolchainConfigDeclared) {
    if (typeof toolchainConfig.outputEsm === 'boolean') {
      return toolchainConfig.outputEsm
    }
    return toolchainConfig.esmBabelEnv != null
  }
  return await confirm({
    type: 'confirm',
    initial: true,
    ifNotInteractive: true,
    message: 'Output ESM in build?',
  })
})
