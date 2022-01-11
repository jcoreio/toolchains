/**
 * @flow
 * @prettier
 */

const { describe, it } = require('mocha')
const { expect } = require('chai')
const sortPlugins = require('../packages/base/util/sortPlugins.cjs')

describe(`sortPlugins`, function () {
  it(`works`, async function () {
    expect(
      sortPlugins({
        a: ['a0', 'a1'],
        b: [
          ['b0', { after: 'a' }],
          ['b1', { before: ['a', 'c'] }],
        ],
        c: [
          ['c0', { after: 'b' }],
          ['c1', { after: ['a', 'b'] }],
        ],
        d: [['d0', { before: 'c', after: 'b' }]],
        e: ['e0'],
        f: ['f0', 'f1'],
        g: [['g0', { insteadOf: ['f', 'a'] }]],
        h: [['h0', { insteadOf: 'g', before: 'e' }]],
      })
    ).to.deep.equal([
      'b1',
      'a0',
      'a1',
      'b0',
      'd0',
      'c0',
      'c1',
      'h0',
      'e0',
      'f0',
      'f1',
    ])
  })
})
