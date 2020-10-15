/* eslint-env node */

const { describe, it, before } = require('mocha')
const spawn = require('../packages/base/lib/spawn')
const copy = require('../packages/base/lib/copy')
const { expect } = require('chai')
const path = require('path')
const _glob = require('glob')
const fs = require('fs-extra')
const { promisify } = require('util')

const readFile = promisify(fs.readFile)

const repoRoot = path.resolve(__dirname, '..')
const fixture = (...args) => path.resolve(repoRoot, 'fixtures', ...args)

const tmp = path.join(require('os').tmpdir(), path.basename(repoRoot))

const glob = promisify(_glob)
const toolchains = ['js', 'js-react', 'ts', 'ts-react']

const toolchainDirs = Object.fromEntries(
  toolchains.map((t) => [t, path.resolve(repoRoot, 'packages', t)])
)
const toolchainNames = Object.fromEntries(
  toolchains.map((t) => [
    t,
    require(path.resolve(repoRoot, 'packages', t, 'package.json')).name,
  ])
)

const expectFilesMatch = async ({ expectedDir, actualDir }) => {
  const files = await promisify(glob)('**', { cwd: expectedDir, nodir: true })
  for (const file of files) {
    expect(
      (await readFile(path.join(actualDir, file), 'utf8')).trim()
    ).to.equal((await readFile(path.join(expectedDir, file), 'utf8')).trim())
  }
}

const env = { ...process.env }
delete env.NODE_ENV
delete env.BABEL_ENV
delete env.INIT_CWD

const yalc = path.resolve(repoRoot, 'node_modules', '.bin', 'yalc')

async function linkToolchain(projectFolder, toolchainName) {
  await spawn(yalc, ['add', '--dev', toolchainName], {
    cwd: projectFolder,
    env,
  })
  await spawn(yalc, ['update'], {
    cwd: projectFolder,
    env,
  })
  await spawn('yarn', { cwd: projectFolder, env })
}

const ignored = new Set(['.nyc_output', 'coverage', 'dist', 'node_modules'])

async function doFixtureTest(name, toolchainName, action) {
  const projectDir = fixture(name, 'project')
  const actualDir = path.join(tmp, name)
  const expectedDir = fixture(name, 'expected')

  await fs.mkdirs(actualDir)
  if (!(await fs.exists(path.join(actualDir, '.git')))) {
    await spawn('git', ['init'], { cwd: actualDir, env })
  }
  for (const entry of await fs.readdir(actualDir)) {
    if (entry !== 'node_modules') await fs.remove(path.join(actualDir, entry))
  }
  for (const file of await fs.readdir(projectDir)) {
    if (!ignored.has(file))
      await fs.copy(path.join(projectDir, file), path.join(actualDir, file))
  }

  await linkToolchain(actualDir, toolchainName)

  await action({ cwd: actualDir })

  await expectFilesMatch({
    actualDir,
    expectedDir,
  })
}

describe(`toolchain`, function () {
  this.timeout(120000)

  it(`prepublishOnly works on mutate project`, async function () {
    await doFixtureTest('mutate', toolchainNames.js, ({ cwd }) =>
      spawn('yarn', ['tc', 'prepublishOnly'], { cwd, env })
    )
  })
  it(`prepublishOnly works on react-transition-context project`, async function () {
    await doFixtureTest(
      'react-transition-context',
      toolchainNames['js-react'],
      ({ cwd }) => spawn('yarn', ['tc', 'prepublishOnly'], { cwd, env })
    )
  })
  it(`prepublishOnly works on typescript-validators project`, async function () {
    await doFixtureTest('typescript-validators', toolchainNames.ts, ({ cwd }) =>
      spawn('yarn', ['tc', 'prepublishOnly'], { cwd, env })
    )
  })
  it(`bootstrap --hard`, async function () {
    this.timeout(60000 * 10)
    await doFixtureTest('bootstrap', toolchainNames.js, ({ cwd }) =>
      spawn('yarn', ['tc', 'bootstrap', '--hard'], { cwd, env })
    )
  })
})
