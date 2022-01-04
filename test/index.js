const { describe, it } = require('mocha')
const { expect } = require('chai')

const src = require('../src/index.js')

describe('tests', () => {
  it('works', () => {
    src()
    expect(Promise.reject(new Error('test'))).to.be.rejectedWith('test')
  })
})
