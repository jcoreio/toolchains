const isInteractive = require('./isInteractive.cjs')

module.exports = async function confirm({
  message,
  initial,
  ifNotInteractive = initial,
}) {
  return isInteractive
    ? (
        await require('prompts')({
          type: 'confirm',
          message,
          initial,
          name: 'yes',
        })
      ).yes
    : ifNotInteractive || false
}
