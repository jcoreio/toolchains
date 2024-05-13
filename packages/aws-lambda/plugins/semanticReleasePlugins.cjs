module.exports = [
  () => [
    require.resolve('@semantic-release/exec'),
    {
      publishCmd: 'npm version ${nextRelease.version} && tc deploy',
    },
  ],
]
