/* eslint-env node */

const { dependencies } = require('./package.json')

module.exports = {
  extends: [
    require.resolve(
      dependencies['@jedwards1211/eslint-config-react']
        ? '@jedwards1211/eslint-config-react'
        : '@jedwards1211/eslint-config'
    ),
    dependencies['@jedwards1211/eslint-config-flow']
      ? require.resolve('@jedwards1211/eslint-config-flow')
      : dependencies['@jedwards1211/eslint-config-typescript']
      ? require.resolve('@jedwards1211/eslint-config-typescript')
      : null,
    require.resolve('eslint-config-prettier'),
  ].filter(Boolean),
  env: {
    'shared-node-browser': true,
    es2020: true,
  },
  settings: {},
}

if (!dependencies['@jedwards1211/eslint-config-typescript'])
  module.exports.parser = require.resolve('babel-eslint')

if (dependencies['@jedwards1211/eslint-config-react'])
  module.exports.settings.react = {
    version: 'detect',
    flowVersion: 'detect',
  }
