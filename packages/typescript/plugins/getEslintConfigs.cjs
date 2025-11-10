const tseslint = require('typescript-eslint')
const { projectDir } = require('@jcoreio/toolchain/util/findUps.cjs')

module.exports = [
  () =>
    tseslint.config(
      [
        ...tseslint.configs.recommendedTypeChecked,
        ...tseslint.configs.strictTypeChecked,
      ].map((conf) => ({
        ...conf,
        files: ['**/*.{ts,tsx,cts,ctsx,mts,mtsx}'],
      })),
      {
        files: ['**/*.{ts,tsx,cts,ctsx,mts,mtsx}'],
        languageOptions: {
          parserOptions: {
            projectService: true,
            tsconfigRootDir: projectDir,
          },
        },
        rules: {
          '@typescript-eslint/ban-ts-comment': 0,
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
      }
    ),
]
