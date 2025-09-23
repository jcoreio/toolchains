const { register } = require('node:module')
const { pathToFileURL } = require('node:url')

register('./babelRegisterEsmWrapper.mjs', pathToFileURL(__filename))
