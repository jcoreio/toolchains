/**
 * @flow
 * @prettier
 */
const { describe, it } = require('mocha')
const { expect } = require('chai')
const execa = require('../../packages/base/util/execa.cjs')
const Path = require('path')

async function getProjectDir(cwd) {
  return (
    await execa(
      'node',
      [
        '-e',
        `try { console.log(require(${JSON.stringify(require.resolve('../../packages/base/util/findUps.cjs'))}).projectDir) } catch (error) { console.log(error.message) }`,
      ],
      {
        cwd,
        stdio: 'pipe',
        encoding: 'utf8',
        maxBuffer: 1024 * 1024,
        env: { ...process.env, JCOREIO_TOOLCHAIN_SELF_TEST: '' },
      }
    )
  ).stdout
}

describe(`findUps`, function () {
  it(`outside toolchain proj`, async function () {
    expect(
      await getProjectDir(Path.resolve(__dirname, '..', '..', '..'))
    ).to.match(/failed to find project package\.json/)
  })
  it(`inside toolchain proj`, async function () {
    expect(await getProjectDir(__dirname)).to.equal(
      Path.resolve(__dirname, '..', '..')
    )
  })
  it(`inside packages/base/util`, async function () {
    expect(
      await getProjectDir(
        Path.resolve(__dirname, '..', '..', 'packages', 'base', 'util')
      )
    ).to.equal(Path.resolve(__dirname, '..', '..'))
  })
})
it(`running tc outside a project shows create command`, async function () {
  const { stderr } = await execa(
    process.execPath,
    [require.resolve('../../packages/base/scripts/toolchain.cjs')],
    {
      cwd: Path.resolve(__dirname, '..', '..', '..'),
      stdio: 'pipe',
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
      env: { ...process.env, JCOREIO_TOOLCHAIN_SELF_TEST: '' },
    }
  ).catch((e) => e)
  expect(stderr).to.match(/create a new toolchain project/)
  expect(stderr).not.to.match(/migrate/)
})
