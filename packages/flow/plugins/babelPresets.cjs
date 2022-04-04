module.exports = [
  [
    () => [require.resolve('@babel/preset-flow')],
    { after: '@jcoreio/toolchain-esnext' },
  ],
]
