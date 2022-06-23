const fs = require('fs-extra')
const { resolve } = require('path')

function ChdirFs(cwd) {
  return {
    copy: (src, dest, ...args) =>
      fs.copy(resolve(cwd, src), resolve(cwd, dest), ...args),
    copySync: (src, dest, ...args) =>
      fs.copySync(resolve(cwd, src), resolve(cwd, dest), ...args),
    stat: (path, ...args) => fs.stat(resolve(cwd, path), ...args),
    statSync: (path, ...args) => fs.statSync(resolve(cwd, path), ...args),
    pathExists: (path, ...args) => fs.pathExists(resolve(cwd, path), ...args),
    pathExistsSync: (path, ...args) =>
      fs.pathExistsSync(resolve(cwd, path), ...args),
    ensureFile: (path, ...args) => fs.ensureFile(resolve(cwd, path), ...args),
    ensureFileSync: (path, ...args) =>
      fs.ensureFileSync(resolve(cwd, path), ...args),
    readFile: (path, ...args) => fs.readFile(resolve(cwd, path), ...args),
    readFileSync: (path, ...args) =>
      fs.readFileSync(resolve(cwd, path), ...args),
    readJson: (path, ...args) => fs.readJson(resolve(cwd, path), ...args),
    readJsonSync: (path, ...args) =>
      fs.readJsonSync(resolve(cwd, path), ...args),
    writeFile: (path, ...args) => fs.writeFile(resolve(cwd, path), ...args),
    writeFileSync: (path, ...args) =>
      fs.writeFileSync(resolve(cwd, path), ...args),
    writeJson: (path, ...args) => fs.writeJson(resolve(cwd, path), ...args),
    writeJsonSync: (path, ...args) =>
      fs.writeJsonSync(resolve(cwd, path), ...args),
    mkdirs: (path, ...args) => fs.mkdirs(resolve(cwd, path), ...args),
    mkdirsSync: (path, ...args) => fs.mkdirsSync(resolve(cwd, path), ...args),
    remove: (path, ...args) => fs.remove(resolve(cwd, path), ...args),
    removeSync: (path, ...args) => fs.removeSync(resolve(cwd, path), ...args),
    readdir: (path, ...args) => fs.readdir(resolve(cwd, path), ...args),
    readdirSync: (path, ...args) => fs.readdirSync(resolve(cwd, path), ...args),
  }
}
module.exports = ChdirFs
