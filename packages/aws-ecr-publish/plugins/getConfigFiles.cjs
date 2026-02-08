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
          FROM node:\${NODE_VERSION} AS build

          WORKDIR /usr/app

          ARG NPM_TOKEN

          # Project uses private NPM modules. Pass in NPM token externally.
          # Tell NPM to use the token from the environment variable
          RUN npm config set --location global \
              "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" \
              "registry=https://registry.npmjs.org/"

          ARG NODE_ENV=production
          ENV NODE_ENV=$NODE_ENV
          COPY package.json pnpm-lock.yaml /usr/app/
          RUN corepack enable && pnpm i --production --frozen-lockfile

          # Build the final image
          FROM node:\${NODE_VERSION}

          WORKDIR /usr/app

          ARG NODE_ENV=production
          ENV NODE_ENV=$NODE_ENV

          EXPOSE 80

          COPY --from=build /usr/app/node_modules /usr/app/node_modules/
          COPY --from=build /usr/app/package.json /usr/app/pnpm-lock.yaml /usr/app/
          COPY src/ /usr/app/src/

          ENV PORT=80

          RUN ["node", "src/index.ts"]
        `,
      }
      return files
    },
    { after: '@jcoreio/toolchain-typescript' },
  ],
]
