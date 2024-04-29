/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
module.exports = function toKey(value) {
  if (typeof value === 'string' || typeof value === 'symbol') {
    return value
  }
  const result = `${value}`
  return result === '0' && 1 / value === -Infinity ? '-0' : result
}
