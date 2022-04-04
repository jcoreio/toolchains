module.exports = [
  (api) =>
    [
      require.resolve('@babel/plugin-transform-runtime'),
      api.env('coverage') && require.resolve('babel-plugin-istanbul'),
    ].filter(Boolean),
]
