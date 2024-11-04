const ParseState = require('./ParseState.cjs')
const ParseError = require('./ParseError.cjs')

const validTypes = [
  'build',
  'chore',
  'ci',
  'docs',
  'feat',
  'fix',
  'perf',
  'refactor',
  'revert',
  'style',
  'test',
]

function parseCommitMessage(message) {
  const state = new ParseState(message)
  const type = state.match(/[^(:! )]+/)
  if (!type || !validTypes.includes(type[0])) {
    throw new ParseError(
      `${
        type ? `invalid type: ${type[0]}` : 'must begin with a type'
      } - valid types are: ${validTypes.join(', ')}`,
      0
    )
  }
  let scope
  if (state.match('(')) {
    scope = state.match(/[^)]+/)
    if (!scope) {
      throw new ParseError('a scope is required after (', state.index)
    }
    if (!state.match(')')) {
      throw new ParseError('missing ) after scope', state.index)
    }
  }
  const bang = state.match(/!/)
  if (!state.match(':')) {
    throw new ParseError('missing : after type/scope', state.index)
  }
  if (!state.match(/\s+/)) {
    throw new ParseError('missing space after :', state.index)
  }

  const description = state.match(/.+$/m)
  if (!description || !/\S/.test(description)) {
    throw new ParseError('missing description', state.index)
  }
  if (!state.match(/\n\s*(\n|$)/) && !state.done) {
    throw new ParseError(
      'there must be a blank line before longer commit body',
      state.index
    )
  }
  const body = state.match(/(.|\n)+/)
  return { type, scope, bang, description, body }
}

module.exports = parseCommitMessage
