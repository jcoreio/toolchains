const dedent = require('dedent-js')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')
const INI = require('@jcoreio/toolchain/util/ini.cjs')

const defaultFlowConfig = dedent`
  [ignore]
  <PROJECT_ROOT>/dist/.*
  <PROJECT_ROOT>/node_modules/.*/test/.*/.*\\.json

  [include]
  ./src
  ./test

  [libs]

  [options]
`

module.exports = [
  async function getConfigFiles() {
    let flowconfig
    if (await fs.pathExists('.flowconfig')) {
      flowconfig = await fs.readFile('.flowconfig', 'utf8')
      const parsed = INI.parse(flowconfig)
      const parsedDefault = INI.parse(defaultFlowConfig)

      let changed = false
      for (const key in parsedDefault) {
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
