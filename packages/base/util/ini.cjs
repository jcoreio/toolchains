var REG_GROUP = /^\s*\[(.+?)\]\s*$/
var REG_ITEM = /^\s*([^#[].*)\s*$/

function parse(string) {
  const object = {}
  const lines = string.split('\n')
  let group
  let match

  for (const line of lines) {
    if ((match = line.match(REG_GROUP)))
      object[match[1]] = group = object[match[1]] || []
    else if (group && (match = line.match(REG_ITEM))) group.push(match[1])
  }

  return object
}

exports.parse = parse

function stringify(ini) {
  const lines = []
  for (const key in ini) {
    if (Object.prototype.hasOwnProperty.call(ini, key)) {
      const group = ini[key]
      if (Array.isArray(group)) {
        lines.push(`[${key}]`)
        for (const item of group) lines.push(item)
        lines.push('')
      }
    }
  }
  return lines.join('\n')
}

exports.stringify = stringify
