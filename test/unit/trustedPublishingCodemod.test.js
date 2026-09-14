const dedent = require('dedent-js')

const { describe, it } = require('mocha')
const { expect } = require('chai')
const trustedPublishingCodemod = require('../../packages/circle/migrations/trustedPublishingCodemod.cjs')

describe('packages/circle', () => {
  it('trustedPublishingCodemod', async () => {
    const defaultConfig = dedent`
      # created by @jcoreio/toolchain-circle
      
      version: 2.1

      orbs:
        codecov: codecov/codecov@4.1.0

      jobs:
        build:
          docker:
            - image: cimg/node:20.10.0
      
          steps:
            - checkout
            - run:
                name: Setup NPM Token
                command: |
                  npm config set \\
                    "//registry.npmjs.org/:_authToken=$NPM_TOKEN" \\
                    "registry=https://registry.npmjs.org/"
            - run:
                name: Corepack enable
                command: sudo corepack enable
            - run:
                name: Install Dependencies
                command: pnpm install --frozen-lockfile
            - run:
                name: Prepublish
                command: |
                  [[ $(netstat -tnlp | grep -F 'circleci-agent') ]] || pnpm run tc prepublish
            - codecov/upload
            - run:
                name: Release
                command: |
                  [[ $(netstat -tnlp | grep -F 'circleci-agent') ]] || pnpm run tc release
      
      workflows:
        build:
          jobs:
            - build:
                context:
                  - npm-release
                  - github-release
    `

    expect(trustedPublishingCodemod(defaultConfig)).to.equal(dedent`
      # created by @jcoreio/toolchain-circle
      
      version: 2.1

      orbs:
        codecov: codecov/codecov@4.1.0

      jobs:
        build:
          docker:
            - image: cimg/node:24.14.1
      
          steps:
            - checkout
            - run:
                name: Corepack enable
                command: sudo corepack enable
            - run:
                name: Install Dependencies
                command: |-
                  env "npm_config_//registry.npmjs.org/:_authToken=$NPM_TOKEN" pnpm install --frozen-lockfile
            - run:
                name: Prepublish
                command: |
                  [[ $(netstat -tnlp | grep -F 'circleci-agent') ]] || pnpm run tc prepublish
            - codecov/upload
            - run:
                name: Release
                command: |
                  export NPM_ID_TOKEN=$(circleci run oidc get --claims '{"aud": "npm:registry.npmjs.org"}')
                  export NPM_TOKEN=
                  [[ $(netstat -tnlp | grep -F 'circleci-agent') ]] || pnpm run tc release

      workflows:
        build:
          jobs:
            - build:
                context:
                  - npm-readonly
                  - github-release
      
    `)
  })
})
