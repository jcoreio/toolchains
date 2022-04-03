const getPluginsArraySync = require('./util/getPluginsArraySync.cjs')

module.exports = {
  extends: [
    ...getPluginsArraySync('getEslintExtends'),
    require.resolve('eslint-config-prettier'),
  ],
}
