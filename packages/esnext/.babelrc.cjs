module.exports = function (api) {
  return {
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          targets: { node: 16 },
        },
      ],
    ],
    plugins: [
      require.resolve('@babel/plugin-transform-runtime'),
      api.env('coverage') && require.resolve('babel-plugin-istanbul'),
    ].filter(Boolean),
  }
}
