const { projectDir } = require('@jcoreio/toolchain/util/findUps.cjs')
const path = require('path')

module.exports = [
  async () => {
    const { ecrDeployer } = await import(
      path.join(projectDir, 'scripts/ecrDeployer.ts')
    )
    if (process.env.CI) {
      await ecrDeployer.buildAndPushIfNecessary()
    } else {
      await ecrDeployer.build()
    }
  },
]
