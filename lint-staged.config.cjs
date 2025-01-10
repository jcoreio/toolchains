const path = require('path')
const getPluginsArraySync = require('@jcoreio/toolchain/util/getPluginsArraySync.cjs')

const lintExtList = getPluginsArraySync('lintExtensions')

const lintExts =
  lintExtList.length === 1
    ? `*.${lintExtList[0]}`
    : `*.{${lintExtList.join(',')}}`

const formatExtList = getPluginsArraySync('formatExtensions')

const formatExts =
  formatExtList.length === 1
    ? `*.${formatExtList[0]}`
    : `*.{${formatExtList.join(',')}}`

const fixtureDir = path.resolve(__dirname, 'fixtures')

const notFixture = (f) => !f.startsWith(fixtureDir)

/* eslint-env node, es2018 */
module.exports = {
  [lintExts]: (files) => {
    return `tc lint:fix ${files.filter(notFixture).join(' ')}`
  },
  [formatExts]: (files) => {
    return `tc format ${files.filter(notFixture).join(' ')}`
  },
}
