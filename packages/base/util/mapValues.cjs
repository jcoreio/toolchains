module.exports = function mapValues(obj, iteratee) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, iteratee(value, key, obj)])
  )
}
