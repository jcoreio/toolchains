#!/usr/bin/env node

process.stdout.write(
  require('resolve-bin').sync(
    process.argv[2],
    process.argv[3] ? { executable: process.argv[3] } : {}
  )
)
