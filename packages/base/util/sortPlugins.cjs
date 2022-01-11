const toposort = require('toposort')

function asArray(x) {
  return Array.isArray(x) ? x : x ? [x] : []
}

function normalizeDef(def) {
  const plugin = Array.isArray(def) ? def[0] : def
  const options = Array.isArray(def) ? def[1] : {}
  return {
    plugin,
    before: asArray(options.before),
    after: asArray(options.after),
    insteadOf: asArray(options.insteadOf),
  }
}

function sortPlugins(defs) {
  const plugins = new Map()
  const edges = []
  const excluded = new Set()

  const makeId = (pkg, i) => JSON.stringify({ pkg, i })

  for (const [pkg, pkgDefs] of Object.entries(defs)) {
    for (let i = 0; i < pkgDefs.length; i++) {
      const id = makeId(pkg, i)
      const def = pkgDefs[i]
      const { plugin, before, after, insteadOf } = normalizeDef(def)
      plugins.set(id, plugin)

      if (before.length) {
        for (const other of before) {
          if (!defs[other]) continue
          for (let i = 0; i < defs[other].length; i++) {
            edges.push([id, makeId(other, i)])
          }
        }
      }
      if (after.length) {
        for (const other of after) {
          if (!defs[other]) continue
          for (let i = 0; i < defs[other].length; i++) {
            edges.push([makeId(other, i), id])
          }
        }
      }
      for (const other of insteadOf) {
        if (!defs[other]) continue
        for (let i = 0; i < defs[other].length; i++) {
          excluded.add(makeId(other, i))
        }
      }
    }
  }
  const sorted = toposort(edges)
  const sortedSet = new Set(sorted)
  for (const [pkg, pkgDefs] of Object.entries(defs)) {
    for (let i = 0; i < pkgDefs.length; i++) {
      const id = makeId(pkg, i)
      if (!sortedSet.has(id)) sorted.push(id)
    }
  }
  return sorted.filter((id) => !excluded.has(id)).map((id) => plugins.get(id))
}

module.exports = sortPlugins
