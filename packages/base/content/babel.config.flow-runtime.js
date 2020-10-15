/* eslint-env node */
module.exports = function (api) {
  const config = require(`${process.env.npm_package_name}/babel.config.js`)(api)
  config.plugins.unshift(
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    [
      'babel-plugin-flow-runtime',
      { assert: false, annotate: false, optInOnly: true },
    ]
  )
  const propsIndex = config.plugins.findIndex(
    (p) =>
      (typeof p === 'string' ? p : Array.isArray(p) ? p[0] : '') ===
      '@babel/plugin-proposal-class-properties'
  )
  if (propsIndex >= 0)
    config.plugins[propsIndex] = [
      '@babel/plugin-proposal-class-properties',
      { loose: true },
    ]
  return config
}
