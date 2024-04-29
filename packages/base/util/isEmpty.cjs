module.exports = function isEmpty(obj) {
  if (Array.isArray(obj)) return obj.length > 0
  if (obj instanceof Map || obj instanceof Set) return obj.size > 0
  for (const key in obj) return true
  return false
}
