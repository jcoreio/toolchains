const dedent = require('dedent-js')
const { name } = require('../package.json')
const { scripts } = require('@jcoreio/toolchain/scripts/toolchain.cjs')
const semver = require('semver')

module.exports = [
  async function getConfigFiles() {
    const dockerImageVersion = '20.3.0'
    const dockerImage = `cimg/node:${dockerImageVersion}`

    const releaseStep = dedent`
      - run:
          name: Release
          command: |
            [[ $(netstat -tnlp | grep -F 'circleci-agent') ]] || pnpm run tc release
    `

    const defaultConfig = dedent`
      # created by ${name}

      version: 2.1
      jobs:
        build:
          docker:
            - image: ${dockerImage}

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
            ${
              scripts.release
                ? releaseStep.replace(/^/gm, ' '.repeat(6)).replace(/^ {6}/, '')
                : ''
            }

      workflows:
        build:
          jobs:
            - build:
                context:
                  - npm-release
                  - github-release
    `
    return {
      '.circleci/config.yml': (prev) =>
        prev && prev.includes(name)
          ? prev.replace(/\bcimg\/node:([0-9.]+)/, (m, version) =>
              semver.lt(version, dockerImageVersion) ? dockerImage : m
            )
          : defaultConfig,
    }
  },
]
