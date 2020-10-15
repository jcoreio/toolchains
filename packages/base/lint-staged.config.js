/* eslint-env node */

const { dependencies } = require('./package.json')

const toolchain = require('./lib/toolchain')

const eslintExts = dependencies['@typescript-eslint/eslint-plugin']
  ? dependencies['eslint-plugin-react']
    ? '*.{ts,tsx}'
    : '*.ts'
  : '*.{js}'

const prettierExts = `*.${[
  dependencies['@babel/preset-typescript'] && '.ts',
  dependencies['@babel/preset-typescript'] &&
    dependencies['@babel/preset-react'] &&
    '.tsx',
  '.js',
  '.json',
  '.md',
]
  .filter(Boolean)
  .join(',')}`

module.exports = {
  [eslintExts]: [`${toolchain.eslintShellCommand()} --fix`],
  [prettierExts]: [`${toolchain.prettierShellCommand()} --write`],
}
