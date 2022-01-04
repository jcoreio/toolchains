const Path = require('path')
const execa = require('execa')
const chalk = require('chalk')
const { projectDir } = require('./findUps.cjs')

function formatArg(arg) {
  if (/^[-_a-z0-9=./]+$/i.test(arg)) return arg
  return `'${arg.replace(/'/g, "'\\''")}'`
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
    chalk`{gray.bold $ ${command} ${args.map(formatArg).join(' ')}}`
  )

  const opts = {
    stdio: 'inherit',
    cwd: projectDir,
    ...options,
    env: {
      ...process.env,
      ...options.env,
      PATH: [
        Path.resolve(__dirname, '..', 'node_modules', '.bin'),
        Path.resolve(projectDir, 'node_modules', '.bin'),
        (options.env || process.env).PATH,
      ].join(Path.delimiter),
    },
  }

  const child = execa(command, args, opts, ...rest)
  child.then(
    (result) => {
      // eslint-disable-next-line no-console
      console.error(
        chalk`{green ✔} {bold ${Path.basename(command)}} exited with code 0`
      )
    },
    (error) => {
      const { code, signal } = error
      if (code) {
        error.message = chalk`{red ✖} {bold ${Path.basename(
          command
        )}} exited with code ${code}`
      }
      if (signal) {
        error.message = chalk`{red ✖} {bold ${Path.basename(
          command
        )}} was killed with signal ${signal}`
      }
    }
  )
  return child
}
