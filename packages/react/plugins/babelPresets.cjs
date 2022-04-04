module.exports = [
  [
    () => [require.resolve('@babel/preset-react')],
    { after: ['@jcoreio/toolchain-esnext', '@jcoreio/toolchain-flow'] },
  ],
]
