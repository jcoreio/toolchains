module.exports = [
  packageJson => {
    const { dependencies } = require('../package.json')
    if (!packageJson.dependencies) packageJson.dependencies = {}
    packageJson.dependencies['@babel/runtime'] = dependencies['@babel/runtime']
  },
]
