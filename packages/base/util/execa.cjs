const Path = require('path')
const execa = require('execa')
const chalk = require('chalk')
const { projectDir, toolchainPackages } = require('./findUps.cjs')

function formatArg(arg) {
  if (/^[-_a-z0-9=./]+$/i.test(arg)) return arg
  return `'${arg.replace(/'/g, "'\\''")}'`
}

function extractCommand(command) {
  command = Path.basename(command).trim()
  const match = /^\S+/.exec(command)
  return match ? match[0] : command
}

module.exports = async function defaultExeca(command, args, options, ...rest) {
  if (args instanceof Object && !Array.isArray(args)) {
    options = args
    args = []
  } else if (!options) {
    options = {}
  }

  // eslint-disable-next-line no-console
  console.error(
    chalk`{gray.bold $ ${command}${
      args ? ' ' + args.map(formatArg).join(' ') : ''
    }}`
  )

  const opts = {
    stdio: 'inherit',
    cwd: projectDir,
    ...options,
    env: {
      ...process.env,
      ...options.env,
      PATH: [
        Path.join(projectDir, 'node_modules', '.bin'),
        ...toolchainPackages.map((pkg) =>
          Path.join(projectDir, 'node_modules', pkg, 'node_modules', '.bin')
        ),
        (options.env || process.env).PATH,
      ].join(Path.delimiter),
    },
  }

  const child = execa(command, args, opts, ...rest)
  child.then(
    (result) => {
      // eslint-disable-next-line no-console
      console.error(
        chalk`{green ✔} {bold ${extractCommand(command)}} exited with code 0`
      )
    },
    (error) => {
      const { code, signal } = error
      if (code) {
        error.message = chalk`{red ✖} {bold ${extractCommand(
          command
        )}} exited with code ${code}`
      }
      if (signal) {
        error.message = chalk`{red ✖} {bold ${extractCommand(
          command
        )}} was killed with signal ${signal}`
      }
    }
  )
  return child
}
