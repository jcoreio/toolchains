/**
 * @flow
 * @prettier
 */

const { it } = require('mocha')
const dedent = require('dedent-js')
const Path = require('path')
const initFixture = require('./util/initFixture')
const expectDirsEqual = require('./util/expectDirsEqual')

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
    console.error(
      '\n' +
        dedent`
        ${'='.repeat(80)}
        ${'='.repeat(80)}
        ${'='.repeat(
          39 - Math.floor(fixture.length / 2)
        )} ${fixture} ${'='.repeat(39 - Math.ceil(fixture.length / 2))}
        ${'='.repeat(80)}
        ${'='.repeat(80)}
      ` +
        '\n'
    )
    const linkdir = await initFixture(fixture)
    await expectDirsEqual(linkdir, Path.resolve(linkdir, '..', 'expected-init'))
  })
}
