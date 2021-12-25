/* eslint-env node */

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-case': [2, 'always', ['lowerCase']],
    'subject-case': [
      0,
      'never',
      ['upper-case', 'camel-case', 'pascal-case', 'snake-case'],
    ],
  },
}
