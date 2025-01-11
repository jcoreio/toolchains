module.exports = {
  parser: '@babel/eslint-parser',
  plugins: ['ft-flow'],
  rules: {
    'ft-flow/boolean-style': [2, 'boolean'],
    'ft-flow/define-flow-type': 1,
    'ft-flow/delimiter-dangle': [2, 'always-multiline'],
    'ft-flow/no-dupe-keys': 2,
    'ft-flow/no-primitive-constructor-types': 2,
    'ft-flow/require-parameter-type': [
      2,
      {
        excludeArrowFunctions: 'expressionsOnly',
      },
    ],
    'ft-flow/require-return-type': [
      2,
      'always',
      {
        annotateUndefined: 'ignore',
        excludeArrowFunctions: 'expressionsOnly',
      },
    ],
    'ft-flow/require-valid-file-annotation': 2,
    'ft-flow/semi': [2, 'never'],
    'ft-flow/space-after-type-colon': [
      2,
      'always',
      {
        allowLineBreak: true,
      },
    ],
    'ft-flow/space-before-generic-bracket': [2, 'never'],
    'ft-flow/space-before-type-colon': [2, 'never'],
    'ft-flow/union-intersection-spacing': [2, 'always'],
    // 'ft-flow/use-flow-type': 1,
  },
  settings: {
    'ft-flow': {
      onlyFilesWithFlowAnnotation: true,
    },
  },
}
