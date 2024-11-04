class ParseState {
  constructor(
    input,
    {
      /**
       * The starting index (defaults to 0)
       */
      start = 0,
      /**
       * The ending index (defaults to input.length)
       */
      end = input.length,
      /**
       * Flags to add to all regexes
       */
      flags = 'g',
    } = {}
  ) {
    this.input = input
    this.start = start
    this.index = start
    this.end = end
    this.flags = flags
  }

  get done() {
    return this.index >= this.end
  }

  /**
   * If pattern matches the input at the current index, returns the match,
   * but doesn't advance the index.
   */
  peek(pattern) {
    if (typeof pattern === 'string') pattern = toRegExp(pattern)
    pattern = new RegExp(
      pattern.source,
      `${this.flags}${pattern.flags.replace(
        new RegExp(`[${this.flags}]`, 'g'),
        ''
      )}`
    )
    pattern.lastIndex = this.index
    const match = pattern.exec(this.input)
    return match &&
      match.index === this.index &&
      match.index + match[0].length <= this.end
      ? match
      : undefined
  }

  /**
   * If pattern matches the input at the current index, returns the match,
   * and advances the index to the end of the match.
   */
  match(pattern) {
    const match = this.peek(pattern)
    if (match) {
      this.index += match[0].length
    }
    return match
  }
}

module.exports = ParseState

function toRegExp(s, flags = '') {
  return new RegExp(s.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&'), flags)
}
