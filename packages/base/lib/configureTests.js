const { dependencies } = require('../package.json')

if (dependencies['jsdom-global']) {
  require('jsdom-global/register')
}
if (dependencies['enzyme']) {
  const { configure } = require('enzyme')
  const Adapter = require('enzyme-adapter-react-16')
  configure({ adapter: new Adapter() })
}

require('@babel/register')({
  extensions: [
    dependencies['@babel/preset-typescript'] &&
      dependencies['@babel/preset-react'] &&
      '.tsx',
    dependencies['@babel/preset-typescript'] && '.ts',
    '.js',
  ].filter(Boolean),
})
