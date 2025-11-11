import { it } from 'mocha'
import { echo } from '../src/index.ts'

it(`echo works`, function () {
  echo('foo', 'bar')
})
