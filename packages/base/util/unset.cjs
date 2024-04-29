const castPath = require('./castPath.cjs')
const toKey = require('./toKey.cjs')

/**
 * The base implementation of `unset`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The property path to unset.
 * @returns {boolean} Returns `true` if the property is deleted, else `false`.
 */
module.exports = function unset(object, path) {
  path = castPath(path, object)
  object = path.slice(0, path.length - 1).reduce((obj, key) => obj[key], object)
  return object == null || delete object[toKey(path[path.length - 1])]
}
