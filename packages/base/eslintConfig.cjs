const getPluginsArraySync = require('./util/getPluginsArraySync.cjs')

module.exports = [...getPluginsArraySync('getEslintConfigs')]
