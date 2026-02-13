const traverse = require('@babel/traverse').default
const { generate } = require('@babel/generator')
const { parse } = require('@babel/parser')
const getBabelParseOpts = require('./getBabelParseOpts.cjs')
const { format } = require('prettier')
const prettierConfig = require('../prettierConfig.cjs')
const replaceRanges = require('./replaceRanges.cjs')

async function addEslintConfigsCodemod({
  file,
  source,
  configs,
  requireGlobals,
}) {
  const ast = parse(source, getBabelParseOpts(file))
  const replacements = []

  let needsRequireGlobals = requireGlobals

  traverse(ast, {
    VariableDeclarator(path) {
      const { id, init } = path.node
      if (
        id.type === 'Identifier' &&
        id.name === 'globals' &&
        init.type === 'CallExpression' &&
        init.callee.type === 'Identifier' &&
        init.callee.name === 'require' &&
        init.arguments.length === 1 &&
        init.arguments[0].type === 'StringLiteral' &&
        init.arguments[0].value === 'globals'
      ) {
        needsRequireGlobals = false
      }
    },
    CallExpression(path) {
      const { callee, arguments: args } = path.node
      const arg0 = args ? args[0] : undefined
      if (
        callee.type !== 'Identifier' ||
        callee.name !== 'defineConfig' ||
        arg0 == null ||
        arg0.type !== 'ArrayExpression'
      ) {
        return
      }

      const { start, end } = arg0
      const needsComma = !/,\s*\]\s*$/.test(source.substring(start, end))
      replacements.push({
        start: end - 1,
        end: end - 1,
        value:
          (needsComma ? ',' : '') +
          configs.map((config) => generate(config).code).join(','),
      })
    },
  })

  if (needsRequireGlobals) {
    replacements.push({
      start: 0,
      end: 0,
      value: `const globals = require('globals')\n`,
    })
  }

  return await format(replaceRanges(source, replacements), {
    ...prettierConfig,
    parser: 'babel',
  })
}
module.exports = addEslintConfigsCodemod
