/**
 * @flow
 * @prettier
 */

const { it } = require('mocha')
const Path = require('path')
const initFixture = require('./util/initFixture')
const expectDirsEqual = require('./util/expectDirsEqual')
const updateExpected = require('./util/updateExpected')

for (const fixture of [
  'async-throttle',
  'find-cycle',
  'log4jcore',
  'react-view-slider',
  'react-view-slider-ts',
]) {
  it(`init ${fixture}`, async function () {
    this.timeout(120000)
    // eslint-disable-next-line no-console
    console.error('\n' + block(fixture) + '\n')
    const linkdir = await initFixture(fixture)
    if (process.env.UPDATE_FIXTURES) {
      await updateExpected(fixture, 'expected-init')
    } else {
      await expectDirsEqual(
        linkdir,
        Path.resolve(linkdir, '..', 'expected-init')
      )
    }
  })
}

function centerPad(text, width = text.length, char = ' ') {
  return text
    .padStart(Math.floor((width + text.length) / 2), char)
    .padEnd(width, char)
}

function block(name) {
  function line(text = '') {
    if (text) text = centerPad(text, 40)
    return centerPad(text, 80, '/')
  }
  return [
    line(),
    line(),
    line(' '),
    line(name),
    line(' '),
    line(),
    line(),
  ].join('\n')
}
