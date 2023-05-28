const getPluginsArraySync = require('../util/getPluginsArraySync.cjs')

module.exports = [
  () => [
    ...getPluginsArraySync('lintExtensions'),
    'js',
    'cjs',
    'mjs',
    'json',
    'md',
  ],
]
