const fs = require('fs-extra')

module.exports = async function flowCi() {
  if (!(await fs.exists('.flowconfig'))) return
  const flowConfig = (await fs.readFile('.flowconfig', 'utf8')).split(
    /\r\n?|\n/gm
  )
  if (!flowConfig.find((l) => l.trim().startsWith('server.max_workers'))) {
    let optionsIndex = flowConfig.findIndex((l) => l.trim() === '[options]')
    if (optionsIndex < 0) {
      optionsIndex = flowConfig.length
      flowConfig.push('[options]')
    }
    flowConfig.splice(optionsIndex + 1, 0, 'server.max_workers=1')
    await fs.writeFile('.flowconfig', flowConfig.join('\n'), 'utf8')
  }
}
