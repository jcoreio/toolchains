const [
  getConfigFiles,
] = require('../../packages/circle/plugins/getConfigFiles.cjs')
const dedent = require('dedent-js')

const { describe, it } = require('mocha')
const { expect } = require('chai')

describe('packages/circle', () => {
  it('getConfigFiles', async () => {
    const getConfig = (await getConfigFiles({}))['.circleci/config.yml']

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

    expect(getConfig()).to.equal(defaultConfig)

    expect(getConfig(defaultConfig)).to.equal(defaultConfig)

    const withoutCodecov = dedent`
      # created by @jcoreio/toolchain-circle
      
      version: 2.1

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

    expect(getConfig(withoutCodecov)).to.equal(defaultConfig)

    expect(
      (await getConfigFiles({ fromVersion: '4.7.0' }))['.circleci/config.yml'](
        withoutCodecov
      )
    ).to.equal(withoutCodecov)

    const unmigratable = dedent`
      # created by @jcoreio/toolchain-circle
      
      version: 2.1

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
                  pnpm run prepublish
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

    expect(getConfig(unmigratable)).to.equal(unmigratable)

    expect(
      getConfig(dedent`
      # created by @jcoreio/toolchain-circle

      version: 2.1

      orbs:
        foo: bar

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
    `)
    ).to.equal(dedent`
      # created by @jcoreio/toolchain-circle
      
      version: 2.1

      orbs:
        codecov: codecov/codecov@4.1.0
        foo: bar

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
    `)
  })
})
