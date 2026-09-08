const js = require('@eslint/js')
const { defineConfig } = require('eslint/config')
const { includeIgnoreFile } = require('@eslint/compat')
const { projectDir } = require('../util/findUps.cjs')
const path = require('path')
const fs = require('../util/projectFs.cjs')
const { globSync } = require('../util/glob.cjs')
const execa = require('../util/execa.cjs')
const globals = require('globals')

module.exports = [
  () => {
    const gitignores = globSync('**/.gitignore')
    try {
      const globalGitignore = execa
        .sync('git', ['config', 'core.excludesFile'], {
          stdio: 'pipe',
          maxBuffer: 1024 * 1024,
          encoding: 'utf8',
        })
        .stdout.trim()
      if (globalGitignore && fs.pathExistsSync(globalGitignore)) {
        gitignores.push(globalGitignore)
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      // ignore
    }
    if (fs.pathExistsSync('.eslintignore')) {
      gitignores.push('.eslintignore')
    }
    return defineConfig([
      ...gitignores.map((file) =>
        includeIgnoreFile(path.resolve(projectDir, file))
      ),
      js.configs.recommended,
      {
        plugins: {
          '@jcoreio/implicit-dependencies': require('@jcoreio/eslint-plugin-implicit-dependencies'),
        },
        rules: {
          '@jcoreio/implicit-dependencies/no-implicit': [
            'error',
            {
              dev: true,
              peer: true,
              optional: true,
            },
          ],
          'no-console': 'error',
          'no-unused-vars': [
            'error',
            {
              args: 'none',
              varsIgnorePattern: 'React',
            },
          ],
          'no-unexpected-multiline': 'error',
          'no-unreachable': 'error',
          'object-shorthand': ['error', 'always'],
        },
      },
      {
        files: ['src/**'],
        ignores: ['**/__tests__/**'],
        plugins: {
          '@jcoreio/implicit-dependencies': require('@jcoreio/eslint-plugin-implicit-dependencies'),
        },
        rules: {
          '@jcoreio/implicit-dependencies/no-implicit': [
            'error',
            {
              dev: false,
              peer: true,
              optional: true,
            },
          ],
        },
      },
      {
        files: ['**/*.{js,cjs,mjs,ts,cts,mts}'],
        ignores: ['src/**', 'test/**'],
        languageOptions: {
          ecmaVersion: 2018,
          globals: {
            ...globals.es2018,
            ...globals.node,
          },
        },
      },
      require('eslint-config-prettier'),
    ])
  },
]
