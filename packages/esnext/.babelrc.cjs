module.exports = function (api) {
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: { node: 16 },
        },
      ],
    ],
    plugins: [
      '@babel/plugin-transform-runtime',
      api.env('coverage') && 'babel-plugin-istanbul',
    ].filter(Boolean),
  }
}
