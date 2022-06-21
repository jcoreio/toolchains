const getPluginsArraySync = require('./util/getPluginsArraySync.cjs')

const lintExtList = getPluginsArraySync('lintExtensions')

const lintExts =
  lintExtList.length === 1
    ? `*.${lintExtList[0]}`
    : `*.{${lintExtList.join(',')}}`

const formatExtList = [
  'js',
  'cjs',
  'mjs',
  'json',
  'md',
  ...getPluginsArraySync('formatExtensions'),
]

const formatExts =
  formatExtList.length === 1
    ? `*.${formatExtList[0]}`
    : `*.{${formatExtList.join(',')}}`

module.exports = {
  [lintExts]: ['tc lint:fix'],
  [formatExts]: ['tc format'],
}
