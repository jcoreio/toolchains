#!/usr/bin/env node

const chalk = require('chalk')
const spawn = require('./spawn.js')
const path = require('path')
const fs = require('fs-extra')

const isFlow = fs.existsSync('.flowconfig')
const isTypescript = fs.existsSync('tsconfig.json')
const hostPackageConfig = require('./hostPackageConfig')
const hostPackageJson = require('./hostPackageJson')
const toolchainPackageJson = require('../package.json')
const runBabel = require('./runBabel')
const resolveBin = require('resolve-bin')
const {
  name: toolchainName,
  version: toolchainVersion,
  dependencies,
} = toolchainPackageJson

const buildingSelf = process.cwd() === path.resolve(__dirname, '..')

const relativePath = (p) =>
  path.relative('', path.normalize(path.resolve(__dirname, p)))

const bin = (pkg, command = pkg) => {
  const naivePath = path.resolve(
    __dirname,
    '..',
    'node_modules',
    '.bin',
    command
  )
  if (fs.existsSync(naivePath)) return naivePath

  return resolveBin.sync(pkg, { executable: command })
}

const spawnable = (command, baseArgs, baseOptions = {}) => (
  args = [],
  options = {}
) =>
  spawn(
    command,
    [
      ...(typeof baseArgs === 'function' ? baseArgs() : baseArgs || []),
      ...args,
    ],
    {
      ...baseOptions,
      ...options,
      env: { ...process.env, ...baseOptions.env, ...options.env },
    }
  )

const prettierArgs = () => [
  '--ignore-path',
  fs.existsSync('.prettierignore') ? '.prettierignore' : '.gitignore',
]
exports.prettierShellCommand = () =>
  `${bin('prettier')} ${prettierArgs().join(' ')}`

const prettier = spawnable(bin('prettier'), prettierArgs)

const eslintArgs = () => [
  '--ignore-path',
  fs.existsSync('.eslintignore') ? '.eslintignore' : '.gitignore',
  '--ignore-pattern',
  'flow-typed/',
  ...(!buildingSelf && dependencies['@babel/preset-typescript']
    ? dependencies['@babel/preset-react']
      ? ['--ext', '.tsx', '--ext', '.ts']
      : ['--ext', '.ts']
    : []),
]
exports.eslintShellCommand = () => `${bin('eslint')} ${eslintArgs().join(' ')}`

const eslint = spawnable(bin('eslint'), eslintArgs)

const mochaArgs = () => [
  '-r',
  relativePath('./configureTests.js'),
  relativePath('./mochaWatchClearConsole.js'),
  ...(Array.isArray(hostPackageConfig.mochaArgs)
    ? hostPackageConfig.mochaArgs
    : [
        !buildingSelf && dependencies['@babel/preset-typescript']
          ? dependencies['@babel/preset-react']
            ? 'test/**.{ts,tsx}'
            : 'test/**.ts'
          : 'test/**.js',
      ]),
]

const mocha = spawnable(bin('mocha'), mochaArgs)

const nycArgs = () => [
  ...(buildingSelf
    ? ['--nycrc-path', relativePath('./nyc.config-self.js')]
    : []),
]

const nyc = spawnable(bin('nyc'), nycArgs)

const lintStaged = spawnable(bin('lint-staged'))

const commitlint = spawnable(bin('commitlint'))

const getCiUrl = () => {
  const repoUrl = hostPackageJson.repository
    ? hostPackageJson.repository.url
    : ''
  const match = /github\.com\/([^/]+)\/([^/.]+)/.exec(repoUrl)
  if (!match) throw new Error(`failed to parse repository.url in package.json`)
  return `https://app.circleci.com/pipelines/github/${match[1]}/${match[2]}`
}

const flow = spawnable(bin('flow-bin', 'flow'))
const tsc = spawnable(bin('typescript', 'tsc'))

const scripts = {
  prettier: {
    description: 'check format with prettier',
    run: (args = []) => prettier(['-c', '.', ...args]),
  },
  format: {
    description: 'format files with prettier',
    run: (args = []) => prettier(['--write', '.', ...args]),
  },
  lint: {
    description: 'check files with eslint',
    run: (args = []) => eslint(['.', ...args]),
  },
  'lint:fix': {
    description: 'check files with eslint and autofix errors',
    run: (args = []) => eslint(['--fix', '.', ...args]),
  },
  clean: {
    description: 'clean build output',
    run: () => fs.remove('dist'),
  },
  check: {
    description: 'check with prettier, eslint, and flow/tsc (if applicable)',
    run: async () => {
      await scripts.prettier.run()
      await scripts.lint.run()
      if (await fs.exists('.flowconfig')) await flow()
      if (await fs.exists('tsconfig.json')) await tsc(['--noEmit'])
    },
  },
  build: {
    description: 'build everything to publish to dist directory',
    run: async () => {
      await scripts.clean.run()
      await runBabel({
        srcDir: 'src',
        destDir: 'dist',
        outFileExtension: '.js',
      })
      await runBabel({
        srcDir: 'src',
        destDir: 'dist',
        outFileExtension: '.mjs',
        envName: 'mjs',
      })
      if (await fs.exists('.flowconfig')) {
        await require('./copyFlowDefs')()
        if (await fs.exists('tsconfig.json')) await require('./copyTsDefs')()
      } else if (!buildingSelf && dependencies['@babel/preset-typescript']) {
        await tsc(['--emitDeclarationOnly', '--outDir', 'dist'])
      }
      await require('./copyOtherFilesToDist')()
      await require('./buildDistPackageJson')('dist')
    },
  },
  test: {
    description: 'run tests with code coverage',
    run: (args = []) =>
      nyc(
        [
          '--reporter=lcov',
          '--reporter=text',
          bin('mocha'),
          ...mochaArgs(),
          ...args,
        ],
        {
          env: { NODE_ENV: 'test', BABEL_ENV: 'coverage' },
        }
      ),
  },
  'test:watch': {
    description: 'run tests in watch mode',
    run: (args = []) =>
      mocha([...args, '--watch'], { env: { NODE_ENV: 'test' } }),
  },
  'test:debug': {
    description: 'run tests in debug mode',
    run: (args = []) =>
      spawn(
        process.execPath,
        ['--inspect-brk', bin('mocha'), ...mochaArgs(), ...args],
        {
          env: { NODE_ENV: 'test' },
        }
      ),
  },
  prepublishOnly: {
    description: 'run check, test, and build',
    run: async () => {
      await scripts.check.run()
      await scripts.test.run()
      await scripts.build.run()
    },
  },
  'pre-commit': {
    description: 'run pre-commit hook checks',
    run: async () => {
      await lintStaged()
      if (isFlow) await flow()
      if (isTypescript) await tsc(['--noEmit'])
    },
  },
  commitlint: {
    description: 'check commit message with commitlint',
    run: commitlint,
  },
  'open:coverage': {
    description: 'open code coverage output in browser',
    run: () => spawn(bin('open-cli'), ['coverage/lcov-report/index.html']),
  },
  'open:ci': {
    description: 'open CircleCI pipelines in browser',
    run: () => spawn(bin('open-cli'), [getCiUrl()]),
  },
  codecov: {
    description: 'upload coverage to codecov',
    run: async () => {
      const dump = nyc(['report', '--reporter=text-lcov'], { stdio: 'pipe' })
      dump.stdout.pipe(fs.createWriteStream('coverage.lcov'))
      await dump
      await spawn(bin('codecov'))
    },
  },
  release: {
    description: 'release package with semantic-release',
    run: (args = []) =>
      spawn(bin('semantic-release'), args, { cwd: path.resolve('dist') }),
  },
  bootstrap: {
    description: 'prepare your project',
    run: (args = []) => require('./bootstrap')({ args }),
  },
  upgrade: {
    description: `upgrade ${toolchainName}`,
    run: (args = []) => spawn('yarn', ['upgrade', toolchainName, ...args]),
  },
  version: {
    description: `print version of ${toolchainName}`,
    run: () => {
      console.log(`${toolchainName}@${toolchainVersion}`) // eslint-disable-line no-console
    },
  },
  'flow-ci': {
    description: `configure Flow for CI`,
    run: () => require('./flowCi')(),
  },
}
exports.scripts = scripts

async function toolchain(command, args) {
  if (!command) {
    /* eslint-disable no-console */
    console.error('Usage: toolchain <command> <arguments...>\n')
    console.error('Available commands:')
    for (const script of Object.keys(scripts).sort()) {
      console.error(
        chalk`  {bold ${script.padEnd(20)}}${scripts[script].description}`
      )
    }
    /* eslint-enable no-console */
    process.exit(1)
  }
  const script = scripts[command]
  if (!script) {
    console.error('Unknown command:', command) // eslint-disable-line no-console
    process.exit(1)
  }

  if (script !== scripts.version) {
    console.error(chalk`{bold ${toolchainName}@${toolchainVersion}}`) // eslint-disable-line no-console
  }

  try {
    await script.run(args)
  } catch (error) {
    const { code } = error
    if (typeof code === 'number' && code !== 0) {
      console.error(error.message) // eslint-disable-line no-console
    } else {
      console.error(error.stack) // eslint-disable-line no-console
    }
    throw error
  }
}
exports.toolchain = toolchain

if (require.main === module) {
  toolchain(process.argv[2], process.argv.slice(3)).then(
    () => {
      process.exit(0)
    },
    (error) => {
      const { code } = error
      if (typeof code === 'number' && code !== 0) {
        process.exit(code)
      } else {
        process.exit(1)
      }
    }
  )
}
