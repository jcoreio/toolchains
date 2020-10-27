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
    dependencies['@jedwards1211/eslint-config-typescript'] &&
      require.resolve('eslint-config-prettier/@typescript-eslint'),
    !dependencies['@jedwards1211/eslint-config-typescript'] &&
      require.resolve('eslint-config-prettier/babel'),
    dependencies['@jedwards1211/eslint-config-flow'] &&
      require.resolve('eslint-config-prettier/flowtype'),
    dependencies['@jedwards1211/eslint-config-react'] &&
      require.resolve('eslint-config-prettier/react'),
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
