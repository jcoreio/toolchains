/* eslint-env node */

const { dependencies } = require('./package.json')
const hostPackageConfig = require('./lib/hostPackageConfig')

module.exports = function (api, { envPresetOptions, babelRuntime } = {}) {
  const isFlow = dependencies['@babel/preset-flow'] != null
  const isTypescript =
    !isFlow && dependencies['@babel/preset-typescript'] != null

  const resolveIfDep = (pkg) =>
    dependencies[pkg] ? require.resolve(pkg) : null

  return {
    plugins: [
      resolveIfDep('@babel/plugin-transform-flow-strip-types'),
      !hostPackageConfig.noBabelRuntime &&
        babelRuntime !== false &&
        require.resolve('@babel/plugin-transform-runtime'),
      require.resolve('@babel/plugin-proposal-class-properties'),
      api.env('coverage') && require.resolve('babel-plugin-istanbul'),
      !api.env(['test', 'coverage']) && [
        require.resolve('./lib/babelPluginResolveFiles.js'),
        { extension: api.env('mjs') ? '.mjs' : '.js' },
      ],
      require.resolve('babel-plugin-add-module-exports'),
      resolveIfDep('babel-plugin-flow-react-proptypes'),
    ].filter(Boolean),
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          targets: { node: 'current' },
          forceAllTransforms: true,
          modules: api.env('mjs') ? false : 'cjs',
          ...envPresetOptions,
        },
      ],
      resolveIfDep('@babel/preset-flow'),
      isTypescript && require.resolve('@babel/preset-typescript'),
      resolveIfDep('@babel/preset-react'),
    ].filter(Boolean),
  }
}
