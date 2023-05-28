module.exports = {
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.mts', '*.mtsx', '*.cts', '*.ctsx'],
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint/eslint-plugin'],
      rules: {
        '@typescript-eslint/member-delimiter-style': 0,
        '@typescript-eslint/no-explicit-any': 0,
      },
    },
  ],
}
