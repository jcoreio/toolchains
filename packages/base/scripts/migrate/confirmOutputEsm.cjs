const once = require('../../util/once.cjs')
const confirm = require('../../util/confirm.cjs')
const { toolchainConfig } = require('../../util/findUps.cjs')

module.exports = once(async () => {
  if (toolchainConfig) {
    if (typeof toolchainConfig.outputEsm === 'boolean') {
      return toolchainConfig.outputEsm
    }
    if (Object.keys(toolchainConfig).length) {
      return toolchainConfig.esmBabelEnv != null
    }
  }
  return await confirm({
    type: 'confirm',
    initial: true,
    ifNotInteractive: true,
    message: 'Output ESM in build?',
  })
})
