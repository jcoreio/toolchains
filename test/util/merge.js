const { describe, it } = require('mocha')
const { expect } = require('chai')
const merge = require('@jcoreio/toolchain/util/merge.cjs')

describe(`merge`, function () {
  it(`works`, function () {
    const object = {
      a: [{ b: 2 }, { d: 4 }],
      b: 3,
      c: 6,
    }

    const other = {
      a: [{ c: 3 }, { e: 5 }],
      b: 5,
      c: { a: 1 },
    }

    expect(merge(object, other)).to.deep.equal({
      a: [
        { b: 2, c: 3 },
        { d: 4, e: 5 },
      ],
      b: 5,
      c: { a: 1 },
    })
  })
})
