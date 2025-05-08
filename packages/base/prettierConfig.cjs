const getPluginsArraySync = require('./util/getPluginsArraySync.cjs')

module.exports = {
  semi: false,
  singleQuote: true,
  trailingComma: 'es5',
  experimentalTernaries: true,
  overrides: getPluginsArraySync('prettierOverrides'),
}
