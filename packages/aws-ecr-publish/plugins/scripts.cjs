const { projectDir } = require('@jcoreio/toolchain/util/findUps.cjs')
const path = require('path')

module.exports = [
  {
    'docker:push': {
      description: 'push docker image to AWS ECR',
      run: async () => {
        const { ecrDeployer } = await import(
          path.join(projectDir, 'scripts/ecrDeployer.ts')
        )
        await ecrDeployer.push()
      },
    },
    'docker:release': {
      description: 'add release tags to docker image in AWS ECR',
      run: async () => {
        const { ecrDeployer } = await import(
          path.join(projectDir, 'scripts/ecrDeployer.ts')
        )
        await ecrDeployer.release()
      },
    },
  },
]
