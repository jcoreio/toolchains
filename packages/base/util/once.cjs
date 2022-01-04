module.exports = function once(fn) {
  let result
  return function onceified() {
    return (result || (result = [fn.apply(this, arguments)]))[0]
  }
}
