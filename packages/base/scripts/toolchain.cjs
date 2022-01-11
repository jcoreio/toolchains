#!/usr/bin/env node

const { name, version } = require('../package.json')
const chalk = require('chalk')

const scripts = {
  bootstrap: require('./bootstrap.cjs'),
  build: require('./build.cjs'),
  check: require('./check.cjs'),
  clean: require('./clean.cjs'),
  coverage: require('./coverage.cjs'),
  format: require('./format.cjs'),
  lint: require('./lint.cjs'),
  'lint:fix': require('./lint-fix.cjs'),
  'open:coverage': require('./open-coverage.cjs'),
  prepublish: require('./prepublish.cjs'),
  test: require('./test.cjs'),
  version: {
    description: `print version of ${name}`,
    run: () => {
      // eslint-disable-next-line no-console
      console.log(`${name}@${version}`)
    },
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
    console.error(chalk`{bold ${name}@${version}}`) // eslint-disable-line no-console
  }

  try {
    await script.run(args)
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
