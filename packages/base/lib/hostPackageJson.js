const path = require('path')
const fs = require('fs-extra')
module.exports = fs.readJsonSync(path.resolve('package.json'))
