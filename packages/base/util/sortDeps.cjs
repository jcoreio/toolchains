function sortedObject(obj) {
  return Object.fromEntries(
    Object.keys(obj)
      .sort()
      .map((key) => [key, obj[key]])
  )
}

function sortDeps(packageJson) {
  for (const section of [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ]) {
    if (packageJson[section])
      packageJson[section] = sortedObject(packageJson[section])
  }
}

module.exports = sortDeps
