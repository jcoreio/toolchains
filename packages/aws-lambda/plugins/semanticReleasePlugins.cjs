module.exports = [
  () => [
    [
      require.resolve('@semantic-release/exec'),
      {
        publishCmd:
          'npm version --no-git-tag-version ${nextRelease.version} && tc deploy',
      },
    ],
  ],
]
