const prompts = require('prompts')

module.exports = async function prompt(...args) {
  const handleKeypress = function (_chunk, key) {
    if (key && key.name === 'c' && key.ctrl) {
      process.kill(process.pid, 'SIGINT')
    }
  }
  try {
    process.stdin.on('keypress', handleKeypress)
    return await prompts(...args)
  } finally {
    process.stdin.off('keypress', handleKeypress)
  }
}
