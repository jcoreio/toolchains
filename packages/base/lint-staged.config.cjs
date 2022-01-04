const lintExtList = ['js', 'cjs', 'mjs']

const lintExts =
  lintExtList.length === 1
    ? `*.${lintExtList[0]}`
    : `*.{${lintExtList.join(',')}}`

const formatExtList = ['ts', 'tsx', 'js', 'cjs', 'mjs', 'json', 'md']

const formatExts =
  formatExtList.length === 1
    ? `*.${formatExtList[0]}`
    : `*.{${formatExtList.join(',')}}`

module.exports = {
  [lintExts]: ['tc lint:fix'],
  [formatExts]: ['tc format'],
}
