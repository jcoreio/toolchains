const { default: traverse } = require('@babel/traverse')

module.exports = function getImportSources(ast) {
  const sources = []
  traverse(ast, {
    ImportDeclaration(path) {
      sources.push(path.node.source)
      path.skip()
    },
    ExportNamedDeclaration(path) {
      sources.push(path.node.source)
      path.skip()
    },
    ExportAllDeclaration(path) {
      sources.push(path.node.source)
      path.skip()
    },
    CallExpression(path) {
      if (
        path.get('callee').isImport() ||
        (path.get('callee').isIdentifier() &&
          path.node.callee.name === 'require')
      ) {
        sources.push(path.node.arguments[0])
        path.skip()
      }
    },
  })
  return sources.filter((n) => n && n.type === 'StringLiteral')
}
