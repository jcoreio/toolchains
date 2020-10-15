const path = require('path')
const resolve = require('resolve')
const { dependencies } = require('../package.json')

const extensions = [
  dependencies['@babel/preset-typescript'] &&
  dependencies['@babel/preset-react']
    ? '.tsx'
    : null,
  dependencies['@babel/preset-typescript'] ? '.ts' : null,
  '.js',
  '.json',
].filter(Boolean)

/**
 * Sets the extension on all relative imports encountered to the extension provided in the plugin options.
 */
module.exports = function babelPluginResolveFiles({ types: t }, opts) {
  function convertSource(file, source) {
    if (!source.startsWith('.')) return source
    const dir = path.dirname(file)
    source = path.relative(
      dir,
      resolve.sync(path.resolve(dir, source), { extensions })
    )
    if (!source.startsWith('.')) source = `./${source}`
    if (source.endsWith('.json')) return source
    return source.replace(/(\.[^./\\]+)?$/, opts.extension)
  }

  const visitor = {
    CallExpression(path, { file }) {
      if (path.node.callee.type !== 'Import') {
        return
      }

      const [source] = path.get('arguments')
      if (source.type !== 'StringLiteral') {
        /* Should never happen */
        return
      }

      source.replaceWith(
        t.stringLiteral(convertSource(file.opts.filename, source.node.value))
      )
    },
    'ImportDeclaration|ExportNamedDeclaration|ExportAllDeclaration'(
      path,
      { file }
    ) {
      const source = path.get('source')

      // An export without a 'from' clause
      if (source.node === null) {
        return
      }

      source.replaceWith(
        t.stringLiteral(convertSource(file.opts.filename, source.node.value))
      )
    },
  }

  return {
    visitor: {
      Program: {
        exit(path, state) {
          path.traverse(visitor, state)
        },
      },
    },
  }
}
