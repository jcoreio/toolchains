/**
 * @flow
 * @prettier
 */

const { describe, it } = require('mocha')
const Path = require('path')
const copyFixture = require('./util/copyFixture')
const expectDirsEqual = require('./util/expectDirsEqual')
const execa = require('execa')

describe(`typescript/react project`, function () {
  this.timeout(60000)
  it(`preinstall && bootstrap && format && lint:fix && prepublish`, async function () {
    const cwd = await copyFixture('react-view-slider-ts')
    await execa(
      process.execPath,
      [require.resolve('../packages/base/scripts/toolchain.cjs'), 'preinstall'],
      { cwd, stdio: 'inherit' }
    )
    await execa(
      'pnpm',
      [
        'add',
        '-D',
        '../packages/base',
        '../packages/esnext',
        '../packages/flow',
        '../packages/react',
        '../packages/typescript',
        'eslint@^8.0.0',
        'eslint-plugin-flowtype@^8.0.0',
        'eslint-plugin-react@^7.0.0',
        'prettier@^2.5.0',
        '@babel/core@^7.11.0',
        '@typescript-eslint/eslint-plugin@^5.29.0',
        '@typescript-eslint/parser@^5.29.0',
      ],
      {
        cwd,
        stdio: 'inherit',
      }
    )
    await execa('tc', ['bootstrap'], { cwd, stdio: 'inherit' })
    // await execa('pnpm', ['add', '-D', '@babel/register'], {
    //   cwd,
    //   stdio: 'inherit',
    // })
    await execa('tc', ['format'], { cwd, stdio: 'inherit' })
    await execa('tc', ['lint:fix'], { cwd, stdio: 'inherit' })
    await execa('tc', ['prepublish'], { cwd, stdio: 'inherit' })
    await expectDirsEqual(
      cwd,
      Path.resolve(cwd, '..', 'expected-preinstall-bootstrap')
    )
  })
})