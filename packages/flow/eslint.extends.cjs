module.exports = {
  plugins: ['eslint-plugin-flowtype'],
  rules: {
    'flowtype/boolean-style': [2, 'boolean'],
    'flowtype/define-flow-type': 1,
    'flowtype/delimiter-dangle': [2, 'always-multiline'],
    'flowtype/no-dupe-keys': 2,
    'flowtype/no-primitive-constructor-types': 2,
    'flowtype/require-parameter-type': [
      2,
      {
        excludeArrowFunctions: 'expressionsOnly',
      },
    ],
    'flowtype/require-return-type': [
      2,
      'always',
      {
        annotateUndefined: 'ignore',
        excludeArrowFunctions: 'expressionsOnly',
      },
    ],
    'flowtype/require-valid-file-annotation': 2,
    'flowtype/semi': [2, 'never'],
    'flowtype/space-after-type-colon': [
      2,
      'always',
      {
        allowLineBreak: true,
      },
    ],
    'flowtype/space-before-generic-bracket': [2, 'never'],
    'flowtype/space-before-type-colon': [2, 'never'],
    'flowtype/union-intersection-spacing': [2, 'always'],
    'flowtype/use-flow-type': 1,
  },
  settings: {
    flowtype: {
      onlyFilesWithFlowAnnotation: true,
    },
  },
}
