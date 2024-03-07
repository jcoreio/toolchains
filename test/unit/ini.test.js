/**
 * @flow
 * @prettier
 */

const { describe, it } = require('mocha')
const { expect } = require('chai')
const INI = require('../../packages/base/util/ini.cjs')
const dedent = require('dedent-js')

describe(`<ini>`, function () {
  it(`parse`, function () {
    expect(
      INI.parse(dedent`
        [ignore]
        <PROJECT_ROOT>/dist/.*
        <PROJECT_ROOT>/node_modules/.*/test/.*/.*\\.json
        
        [include]
        ./src
        ./test
        
        [libs]
        
        [options]
        #blah
      `)
    ).to.deep.equal({
      ignore: [
        '<PROJECT_ROOT>/dist/.*',
        '<PROJECT_ROOT>/node_modules/.*/test/.*/.*\\.json',
      ],
      include: ['./src', './test'],
      libs: [],
      options: [],
    })
  })
  it(`stringify`, function () {
    expect(
      INI.stringify({
        ignore: [
          '<PROJECT_ROOT>/dist/.*',
          '<PROJECT_ROOT>/node_modules/.*/test/.*/.*\\.json',
        ],
        include: ['./src', './test'],
        libs: [],
        options: [],
      })
    ).to.equal(dedent`
      [ignore]
      <PROJECT_ROOT>/dist/.*
      <PROJECT_ROOT>/node_modules/.*/test/.*/.*\\.json
      
      [include]
      ./src
      ./test
      
      [libs]
      
      [options]

    `)
  })
})
