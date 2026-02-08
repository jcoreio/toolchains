module.exports = [
  () => [
    [
      require.resolve('@semantic-release/exec'),
      {
        prepareCmd: 'npm version ${nextRelease.version} --no-git-tag-version',
        publishCmd: 'tc docker:release',
      },
    ],
  ],
]
