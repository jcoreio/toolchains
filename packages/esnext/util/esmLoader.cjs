const { register } = require('node:module')
const { pathToFileURL } = require('node:url')

register('babel-register-esm', pathToFileURL(__filename))
