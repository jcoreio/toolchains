const fs = require('fs-extra')
const { promisify } = require('util')
const path = require('path')
const glob = require('glob')

const babel = require('@babel/core')
const traverse = require('@babel/traverse').default

module.exports = async function needBabelRuntime(dist) {
  let babelRuntimeFound = false

  function processSource(source) {
    if (!source.node || source.node.type !== 'StringLiteral') return
    if (source.node.value.startsWith('@babel/runtime')) {
      babelRuntimeFound = true
      source.stop()
    }
  }

  for (const file of await promisify(glob)('**.{js,cjs,mjs}', { cwd: dist })) {
    const ast = await babel.parseAsync(
      await fs.readFile(path.join(dist, file), 'utf8'),
      {
        cwd: dist,
      }
    )
    traverse(ast, {
      CallExpression(path) {
        if (
          path.node.callee.type == 'Import' ||
          (path.node.callee.type === 'Identifier' &&
            path.node.callee.name === 'require')
        ) {
          processSource(path.get('arguments')[0])
        }
      },
      'ImportDeclaration|ExportNamedDeclaration|ExportAllDeclaration'(path) {
        processSource(path.get('source'))
      },
    })
    if (babelRuntimeFound) break
  }
  return babelRuntimeFound
}
