const resolveImportSource = require('./resolveImportSource.cjs')

module.exports = function babelPluginResolveImports({ types: t }) {
  function handleSource(path, state) {
    if (!path || !path.node) return
    const source = path.node.value
    const outputExtension = state.opts && state.opts.outputExtension
    const resolved = resolveImportSource({
      file: state.filename,
      source,
      outputExtension,
    })
    if (resolved !== source) {
      path.replaceWith(t.stringLiteral(resolved))
    }
  }

  return {
    visitor: {
      ImportDeclaration(path, state) {
        handleSource(path.get('source'), state)
      },
      ExportNamedDeclaration(path, state) {
        handleSource(path.get('source'), state)
      },
      ExportAllDeclaration(path, state) {
        handleSource(path.get('source'), state)
      },
      CallExpression(path, state) {
        if (
          (path.get('callee').isImport() ||
            (path.get('callee').isIdentifier() &&
              path.node.callee.name === 'require')) &&
          path.node.arguments.length === 1 &&
          path.get('arguments')[0].isStringLiteral()
        ) {
          handleSource(path.get('arguments')[0], state)
        }
      },
    },
  }
}
