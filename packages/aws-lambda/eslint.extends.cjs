const { packageJson } = require('@jcoreio/toolchain/util/findUps.cjs')

module.exports = {
  overrides: [
    {
      files: ['src/**'],
      excludedFiles: ['**/__tests__/**'],
      rules: {
        '@jcoreio/implicit-dependencies/no-implicit': [
          'error',
          {
            dev: false,
            peer: true,
            optional: true,
            ignore: Object.keys(packageJson.devDependencies || {}).filter(
              (dep) => dep.startsWith('@aws-sdk/')
            ),
          },
        ],
      },
    },
  ],
}
