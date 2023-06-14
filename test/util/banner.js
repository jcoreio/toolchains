function centerPad(text, width = text.length, char = ' ') {
  return text
    .padStart(Math.floor((width + text.length) / 2), char)
    .padEnd(width, char)
}

function banner(name) {
  function line(text = '') {
    if (text) text = centerPad(text, 40)
    return centerPad(text, 80, '/')
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
