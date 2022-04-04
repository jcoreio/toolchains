module.exports = [
  () => [
    [
      require.resolve('@babel/preset-env'),
      {
        targets: { node: 16 },
      },
    ],
  ],
]
