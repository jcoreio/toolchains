module.exports = {
  extends: [require.resolve('@commitlint/config-conventional')],
  rules: {
    'scope-case': [2, 'always', ['lowerCase']],
    'subject-case': [
      0,
      'never',
      ['upper-case', 'camel-case', 'pascal-case', 'snake-case'],
    ],
  },
}
