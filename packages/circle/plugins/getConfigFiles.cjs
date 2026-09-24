const dedent = require('dedent-js')
const { name } = require('../package.json')
const { scripts } = require('@jcoreio/toolchain/scripts/toolchain.cjs')
const semver = require('semver')
const trustedPublishingCodemod = require('../migrations/trustedPublishingCodemod.cjs')
const npmTrustCircle = require('../scripts/npmTrustCircle.cjs')

module.exports = [
  function getConfigFiles({ fromVersion }) {
    const dockerImageVersion = '24.14.1'
    const dockerImage = `cimg/node:${dockerImageVersion}`

    const releaseStep = dedent`
      - run:
          name: Release
          command: |
            [[ $(netstat -tnlp | grep -F 'circleci-agent') ]] || pnpm run tc release
    `

    const codecovVersion = '4.1.0'

    const defaultConfig = dedent`
      # created by ${name}

      version: 2.1

      orbs:
        codecov: codecov/codecov@${codecovVersion}

      jobs:
        build:
          docker:
            - image: ${dockerImage}

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
            ${
              scripts.release ?
                releaseStep.replace(/^/gm, ' '.repeat(6)).replace(/^ {6}/, '')
              : ''
            }

      workflows:
        build:
          jobs:
            - build:
                context:
                  - npm-readonly
                  - github-release\n
    `
    return {
      '.circleci/config.yml': async (config) => {
        if (
          !config ||
          (semver.lt(fromVersion || '0.0.0', '3.0.0') && !config.includes(name))
        ) {
          return defaultConfig
        }
        config = config.replace(/\bcimg\/node:([0-9.]+)/, (m, version) =>
          semver.lt(version, dockerImageVersion) ? dockerImage : m
        )
        if (
          semver.lt(fromVersion || '0.0.0', '4.7.0') &&
          !config.includes('codecov')
        ) {
          if (!/tc prepublish\n(\s*)- run:/m.test(config)) {
            // eslint-disable-next-line no-console
            console.error(
              'WARNING: failed to add codecov upload to .circleci/config.yml'
            )
            return config
          }
          if (/^orbs:/m.test(config)) {
            config = config.replace(
              /^orbs:/m,
              `orbs:\n  codecov: codecov/codecov@${codecovVersion}`
            )
          } else if (/^(version:.*)/m.test(config)) {
            config = config.replace(
              /^(version:.*)/m,
              `$1\n\norbs:\n  codecov: codecov/codecov@${codecovVersion}`
            )
          } else {
            // eslint-disable-next-line no-console
            console.error(
              'WARNING: failed to add codecov upload to .circleci/config.yml'
            )
            return config
          }
          config = config.replace(
            /tc prepublish\n(\s*)- run:/m,
            'tc prepublish\n$1- codecov/upload\n$1- run:'
          )
        }
        if (
          semver.lt(fromVersion || '0.0.0', '5.13.0') &&
          !config.includes('NPM_ID_TOKEN=')
        ) {
          config = trustedPublishingCodemod(config)
          await npmTrustCircle({ config: require('yaml').parse(config) }).catch(
            () => {}
          )
        }
        if (semver.lt(fromVersion || '0.0.0', '6.0.0-beta.1')) {
          config = config.replace(
            /^\s*export NPM_ID_TOKEN=\$\(circleci run oidc get --claims '\{"aud": "npm:registry.npmjs.org"\}'\)\s*?\n\s*export NPM_TOKEN=\s*?\n/gm,
            ''
          )
        }
        return config
      },
    }
  },
]
