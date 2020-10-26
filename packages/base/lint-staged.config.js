/* eslint-env node */

const { dependencies } = require('./package.json')

const toolchain = require('./lib/toolchain')

const eslintExts = dependencies['@typescript-eslint/eslint-plugin']
  ? dependencies['eslint-plugin-react']
    ? '*.{ts,tsx}'
    : '*.ts'
  : '*.js'

const prettierExtList = [
  dependencies['@babel/preset-typescript'] && 'ts',
  dependencies['@babel/preset-typescript'] &&
    dependencies['@babel/preset-react'] &&
    'tsx',
  'js',
  'json',
  'md',
].filter(Boolean)

const prettierExts =
  prettierExtList.length === 1
    ? `*.${prettierExtList[0]}`
    : `*.{${prettierExtList.join(',')}}`

module.exports = {
  [eslintExts]: [`${toolchain.eslintShellCommand()} --fix`],
  [prettierExts]: [`${toolchain.prettierShellCommand()} --write`],
}
