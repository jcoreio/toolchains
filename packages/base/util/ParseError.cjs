class ParseError extends Error {
  constructor(message, from, to = from) {
    super(message)
    this.name = 'ParseError'
    this.from = from
    this.to = to
  }
}

module.exports = ParseError
