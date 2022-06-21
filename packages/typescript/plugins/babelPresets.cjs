module.exports = [
  [
    () => [require.resolve('@babel/preset-typescript')],
    { after: '@jcoreio/toolchain-esnext' },
  ],
]
