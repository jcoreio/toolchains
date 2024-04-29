module.exports = function merge(a, ...b) {
  return b.reduce((a, b) => {
    if (!(a instanceof Object) || !(b instanceof Object)) return a
    for (const key in b) {
      const aValue = a[key]
      const bValue = b[key]
      if (aValue instanceof Object && bValue instanceof Object) {
        merge(aValue, bValue)
      } else {
        a[key] = bValue
      }
    }
    return a
  }, a)
}
