#!/usr/bin/env node

require('../scripts/runEslint.cjs')
  .eslintFix()
  .then(
    () => process.exit(0),
    (error) => process.exit(error.code != null ? error.code : 1)
  )
