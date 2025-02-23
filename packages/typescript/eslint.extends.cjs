module.exports = {
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.mts', '*.mtsx', '*.cts', '*.ctsx'],
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/strict-type-checked',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: true,
      },
      plugins: ['@typescript-eslint/eslint-plugin'],
      rules: {
        '@typescript-eslint/member-delimiter-style': 0,
        '@typescript-eslint/no-confusing-void-expression': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-invalid-void-type': 0,
        '@typescript-eslint/no-unsafe-argument': 0,
        '@typescript-eslint/no-unsafe-assignment': 0,
        '@typescript-eslint/no-unsafe-call': 0,
        '@typescript-eslint/no-unsafe-declaration-merging': 0,
        '@typescript-eslint/no-unsafe-enum-comparison': 0,
        '@typescript-eslint/no-unsafe-member-access': 0,
        '@typescript-eslint/no-unsafe-return': 0,
        '@typescript-eslint/require-await': 0,
        '@typescript-eslint/restrict-template-expressions': 0,
      },
    },
  ],
}
