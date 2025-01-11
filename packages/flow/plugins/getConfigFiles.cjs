const dedent = require('dedent-js')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const INI = require('@jcoreio/toolchain/util/ini.cjs')
const semver = require('semver')

const defaultFlowConfig = dedent`
  [ignore]
  <PROJECT_ROOT>/dist/.*
  .*/malformed_package_json/.*
  .*/node_modules/.*/hermes-.*/.*

  [include]
  ./src
  ./test

  [libs]

  [options]
`

module.exports = [
  async function getConfigFiles({ fromVersion }) {
    let flowconfig
    if (await fs.pathExists('.flowconfig')) {
      flowconfig = await fs.readFile('.flowconfig', 'utf8')
      if (fromVersion && semver.gte(fromVersion, '5.1.0')) {
        return { '.flowconfig': flowconfig }
      }
      const parsed = INI.parse(flowconfig)
      const parsedDefault = INI.parse(defaultFlowConfig)

      let changed = false
      for (const key in parsedDefault) {
        if (fromVersion && key === 'include') {
          continue
        }
        if (parsed[key]) {
          for (const item of parsedDefault[key]) {
            if (!parsed[key].includes(item)) {
              parsed[key].push(item)
              changed = true
            }
          }
        } else {
          parsed[key] = parsedDefault[key]
          changed = true
        }
      }
      if (changed) flowconfig = INI.stringify(parsed)
    } else {
      flowconfig = defaultFlowConfig
    }
    const files = {
      '.flowconfig': {
        content: flowconfig,
        overwrite: true,
      },
    }
    return files
  },
]
