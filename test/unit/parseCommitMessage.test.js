const { describe, it } = require('mocha')
const { expect } = require('chai')

const parseCommitMessage = require('../../packages/base/util/parseCommitMessage.cjs')
const ParseError = require('../../packages/base/util/ParseError.cjs')

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

describe(`parseCommitMessage`, function () {
  for (const [input, expected] of Object.entries({
    'fix: do stuff': {
      type: 'fix',
      description: 'do stuff',
    },
    'fix(foo): do stuff': {
      type: 'fix',
      scope: 'foo',
      description: 'do stuff',
    },
    'fix(foo)!: do stuff': {
      type: 'fix',
      scope: 'foo',
      bang: '!',
      description: 'do stuff',
    },
    'fix!: do stuff': {
      type: 'fix',
      bang: '!',
      description: 'do stuff',
    },
    'fix!: do stuff\n': {
      type: 'fix',
      bang: '!',
      description: 'do stuff',
    },
    'fix!: do stuff\n\n': {
      type: 'fix',
      bang: '!',
      description: 'do stuff',
    },
    'fix!: do stuff\n  \n   ': {
      type: 'fix',
      bang: '!',
      description: 'do stuff',
    },
    'fix!: do stuff\n\nBREAKING CHANGE: broke everything\n\nApproved-by: Jesus':
      {
        type: 'fix',
        bang: '!',
        description: 'do stuff',
        body: 'BREAKING CHANGE: broke everything\n\nApproved-by: Jesus',
      },
    ' fix: do stuff': new ParseError(
      `must begin with a type - valid types are: ${validTypes.join(', ')}`,
      0
    ),
    'fix_stuff: do stuff': new ParseError(
      `invalid type: fix_stuff - valid types are: ${validTypes.join(', ')}`,
      0
    ),
    'fix do stuff': new ParseError('missing : after type/scope', 3),
    'fix:do stuff': new ParseError('missing space after :', 4),
    'fix!!: do stuff': new ParseError('missing : after type/scope', 4),
    'fix: ': new ParseError('missing description', 5),
    'fix:   \n': new ParseError('missing description', 5),
    'fix: do stuff\nblahblah': new ParseError(
      'there must be a blank line before longer commit body',
      13
    ),
  })) {
    it(input, function () {
      if (expected instanceof ParseError) {
        expect(() => parseCommitMessage(input))
          .to.throw(ParseError)
          .that.deep.equals(expected)
      } else {
        const parsed = parseCommitMessage(input)
        const actual = {}
        for (const key of Object.keys(parsed)) {
          if (parsed[key]) actual[key] = parsed[key][0]
        }
        expect(actual).to.deep.equal(expected)
      }
    })
  }
})
