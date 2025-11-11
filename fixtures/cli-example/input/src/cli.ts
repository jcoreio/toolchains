#!/usr/bin/env node

import { echo } from './index.ts'

echo(...process.argv.slice(2))
