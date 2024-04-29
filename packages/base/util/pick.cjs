module.exports = function pick(obj, ...keys) {
  const keysSet = new Set(keys.flat())
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => keysSet.has(key))
  )
}
