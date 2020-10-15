const toolchainName = require('../package.json').name
module.exports = require('./hostPackageJson')[toolchainName] || {}
