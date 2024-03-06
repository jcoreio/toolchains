const valuedOptions = new Set([
  '--global',
  '--globals',
  '-j',
  '--jobs',
  '--retries',
  '-s',
  '--slow',
  '-t',
  '--timeout',
  '--timeouts',
  '-u',
  '--ui',
  '-R',
  '--reporter',
  '-O',
  '--reporter-option',
  '--reporter-options',
  '--config',
  '-n',
  '--no-options',
  '--package',
  '--extension',
  '--file',
  '--ignore',
  '--exclude',
  '-r',
  '--require',
  '--watch-files',
  '--watch-ignore',
  '-f',
  '--fgrep',
  '-g',
  '--grep',
])

module.exports = process.argv
  .slice(2)
  .filter(
    (f, index, argv) =>
      !f.startsWith('-') && !valuedOptions.has(argv[index - 1])
  )
