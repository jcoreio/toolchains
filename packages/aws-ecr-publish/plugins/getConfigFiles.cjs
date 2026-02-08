const dedent = require('dedent-js')
const { packageJson } = require('@jcoreio/toolchain/util/findUps.cjs')
const { inspect } = require('util')

module.exports = [
  [
    async function getConfigFiles() {
      const files = {
        'scripts/ecrDeployer.ts': dedent`
          import { ECRDeployer } from '@jcoreio/aws-ecr-utils'
          import { fileURLToPath } from 'url'

          export const ecrDeployer = new ECRDeployer({
            repositoryName: ${inspect(packageJson.name.replace(/^@/, ''))},
            build: {
              path: fileURLToPath(import.meta.resolve('..')),
            },
          })
        `,
        'tsconfig.json': JSON.stringify(
          {
            extends: '@jcoreio/toolchain-aws-ecr-publish/tsconfig.json',
            include: ['./src', './test', './*.ts'],
            exclude: ['node_modules'],
          },
          null,
          2
        ),
        Dockerfile: dedent`
          ARG NODE_VERSION=24
          FROM node:\${NODE_VERSION}

          WORKDIR /usr/app

          ARG NODE_ENV=production
          ENV NODE_ENV=$NODE_ENV
          COPY package.json pnpm-lock.yaml /usr/app/
          RUN --mount=type=secret,id=npmrc,target=/usr/app/.npmrc \
              corepack enable && pnpm i --production --frozen-lockfile

          EXPOSE 80

          COPY src/ /usr/app/src/

          RUN ["node", "src/index.ts"]
        `,
      }
      return files
    },
    { after: '@jcoreio/toolchain-typescript' },
  ],
]
