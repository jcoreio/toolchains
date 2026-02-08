const { projectDir } = require('@jcoreio/toolchain/util/findUps.cjs')
const path = require('path')

module.exports = [
  {
    build: {
      description:
        'build docker image (and push to AWS ECR if necessary in CI)',
      run: async (args = []) => {
        const { ecrDeployer } = await import(
          path.join(projectDir, 'scripts/ecrDeployer.ts')
        )
        if (process.env.CI) {
          await ecrDeployer.buildAndPushIfNecessary()
        } else {
          await ecrDeployer.build()
        }
      },
    },
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
