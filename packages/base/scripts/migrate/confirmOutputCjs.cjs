const once = require('../../util/once.cjs')
const confirm = require('../../util/confirm.cjs')
const {
  toolchainConfig,
  toolchainConfigDeclared,
} = require('../../util/findUps.cjs')

module.exports = once(async () => {
  if (toolchainConfig && toolchainConfigDeclared) {
    if (typeof toolchainConfig.outputCjs === 'boolean') {
      return toolchainConfig.outputCjs
    }
    return toolchainConfig.cjsBabelEnv != null
  }
  return await confirm({
    type: 'confirm',
    initial: true,
    ifNotInteractive: true,
    message: 'Output CJS in build?',
  })
})
