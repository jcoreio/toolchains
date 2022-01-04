const ChdirFs = require('./ChdirFs.cjs')
const { projectDir } = require('./findUps.cjs')

module.exports = ChdirFs(projectDir)
