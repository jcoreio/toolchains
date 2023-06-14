function centerPad(text, width = text.length, char = ' ') {
  return text
    .padStart(Math.floor((width + text.length) / 2), char)
    .padEnd(width, char)
}

function banner(name, width = 80) {
  function line(text = '') {
    if (text) text = centerPad(text, width - 40)
    return centerPad(text, width, '/')
  }
  return [
    line(),
    line(),
    line(' '),
    line(name),
    line(' '),
    line(),
    line(),
  ].join('\n')
}

module.exports = banner
