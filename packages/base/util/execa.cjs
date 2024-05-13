const Path = require('path')
const execa = require('execa')
const chalk = require('chalk')

function formatArg(arg) {
  if (/^[-_a-z0-9=./]+$/i.test(arg)) return arg
  return `'${arg.replace(/'/g, "'\\''")}'`
}

function extractCommand(command) {
  command = Path.basename(command).trim()
  const match = /^\S+/.exec(command)
  return match ? match[0] : command
}

function getExecaArgs(command, args, options, ...rest) {
  let projectDir, toolchainPackages
  try {
    ;({ projectDir, toolchainPackages } = require('./findUps.cjs'))
  } catch (error) {
    projectDir = process.cwd()
    toolchainPackages = []
  }
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
    ...options,
    cwd: options.cwd ? Path.resolve(projectDir, options.cwd) : projectDir,
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

  return [command, args, opts, ...rest]
}

function convertExecaError(command, error) {
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
  return error
}

function logSuccess(command) {
  // eslint-disable-next-line no-console
  console.error(
    chalk`{green ✔} {bold ${extractCommand(command)}} exited with code 0`
  )
}

function defaultExeca(command, args, options, ...rest) {
  return execa(...getExecaArgs(command, args, options, ...rest)).then(
    (result) => {
      logSuccess(command)
      return result
    },
    (error) => {
      throw convertExecaError(command, error)
    }
  )
}

function defaultExecaSync(command, args, options, ...rest) {
  try {
    const result = execa.sync(...getExecaArgs(command, args, options, ...rest))
    logSuccess(command)
    return result
  } catch (error) {
    throw convertExecaError(command, error)
  }
}

defaultExeca.sync = defaultExecaSync

module.exports = defaultExeca
