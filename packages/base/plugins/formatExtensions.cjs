const getPluginsArraySync = require('../util/getPluginsArraySync.cjs')

module.exports = [
  () => [
    ...getPluginsArraySync('sourceExtensions'),
    'js',
    'cjs',
    'mjs',
    'json',
    'md',
  ],
]
