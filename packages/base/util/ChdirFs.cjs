const fs = require('fs-extra')
const Path = require('path')

function ChdirFs(cwd) {
  return {
    stat: (path, ...args) => fs.stat(Path.resolve(cwd, path), ...args),
    statSync: (path, ...args) => fs.statSync(Path.resolve(cwd, path), ...args),
    pathExists: (path, ...args) =>
      fs.pathExists(Path.resolve(cwd, path), ...args),
    pathExistsSync: (path, ...args) =>
      fs.pathExistsSync(Path.resolve(cwd, path), ...args),
    ensureFile: (path, ...args) =>
      fs.ensureFile(Path.resolve(cwd, path), ...args),
    ensureFileSync: (path, ...args) =>
      fs.ensureFileSync(Path.resolve(cwd, path), ...args),
    readFile: (path, ...args) => fs.readFile(Path.resolve(cwd, path), ...args),
    readFileSync: (path, ...args) =>
      fs.readFileSync(Path.resolve(cwd, path), ...args),
    readJson: (path, ...args) => fs.readJson(Path.resolve(cwd, path), ...args),
    readJsonSync: (path, ...args) =>
      fs.readJsonSync(Path.resolve(cwd, path), ...args),
    writeFile: (path, ...args) =>
      fs.writeFile(Path.resolve(cwd, path), ...args),
    writeFileSync: (path, ...args) =>
      fs.writeFileSync(Path.resolve(cwd, path), ...args),
    writeJson: (path, ...args) =>
      fs.writeJson(Path.resolve(cwd, path), ...args),
    writeJsonSync: (path, ...args) =>
      fs.writeJsonSync(Path.resolve(cwd, path), ...args),
  }
}
module.exports = ChdirFs
