/* eslint-env node */

const { dependencies } = require('./package.json')

module.exports = {
  include: dependencies['@babel/preset-typescript']
    ? dependencies['@babel/preset-react']
      ? ['src/**.ts', 'src/**.tsx']
      : ['src/**.ts']
    : ['src/**.js'],
  require: [require.resolve('@babel/register')],
  sourceMap: false,
  instrument: false,
}
