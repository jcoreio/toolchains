#!/usr/bin/env node

const { name, version } = require('../package.json')
const chalk = require('chalk')
const getPluginsObjectSync = require('../util/getPluginsObjectSync.cjs')
const execa = require('../util/execa.cjs')

let toolchainConfig, isMonorepoRoot
try {
  ;({ toolchainConfig, isMonorepoRoot } = require('../util/findUps.cjs'))
} catch (error) {
  if (!error.message.startsWith('failed to find project package.json')) {
    throw error
  }
}
const scripts = toolchainConfig
  ? {
      badges: require('./badges.cjs'),
      migrate: require('./migrate.cjs'),
      build: require('./build.cjs'),
      'build:smoke-test': require('./smokeTestBuild.cjs'),
      check: require('./check.cjs'),
      clean: require('./clean.cjs'),
      format: require('./format.cjs'),
      init: require('./init.cjs'),
      preinstall: require('./preinstall.cjs'),
      lint: require('./lint.cjs'),
      'lint:fix': require('./lint-fix.cjs'),
      'open:coverage': require('./open-coverage.cjs'),
      prepublish: require('./prepublish.cjs'),
      upgrade: require('./upgrade.cjs'),
      version: {
        description: `print version of ${name}`,
        run: () => {
          // eslint-disable-next-line no-console
          console.log(`${name}@${version}`)
        },
      },
      'install-git-hooks': require('./install-git-hooks.cjs'),
      ...(isMonorepoRoot ? { create: require('./create.cjs') } : {}),
      ...getPluginsObjectSync('scripts'),
      ...Object.fromEntries(
        Object.entries(toolchainConfig.scripts || {}).map(([name, script]) => [
          name,
          typeof script === 'string'
            ? {
                run: (args = []) =>
                  execa([script, ...args].join(' '), { shell: true }),
                description: script,
              }
            : script,
        ])
      ),
    }
  : {
      create: require('./create.cjs'),
    }

exports.scripts = scripts

async function toolchain(command, args) {
  if (!command) {
    /* eslint-disable no-console */
    console.error('Usage: toolchain <command> <arguments...>\n')
    console.error('Available commands:')
    const scriptColWidth =
      Math.max(...Object.keys(scripts).map((s) => s.length)) + 1
    for (const script of Object.keys(scripts).sort()) {
      console.error(
        chalk`  {bold ${script.padEnd(scriptColWidth)}}${
          scripts[script].description
        }`
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

  if (require.main === module && script !== scripts.version) {
    console.error(chalk`{bold ${name}@${version}}`) // eslint-disable-line no-console
  }

  try {
    if (!command.startsWith('pre' && scripts[`pre${command}`])) {
      await (scripts[`pre${command}`] && scripts[`pre${command}`].run(args))
    }
    await script.run(args)
    if (!command.startsWith('post')) {
      await (scripts[`post${command}`] && scripts[`post${command}`].run(args))
    }
  } catch (error) {
    const { exitCode } = error
    if (typeof exitCode === 'number' && exitCode !== 0) {
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
      const { exitCode } = error
      if (typeof exitCode === 'number' && exitCode !== 0) {
        process.exit(exitCode)
      } else {
        process.exit(1)
      }
    }
  )
}
