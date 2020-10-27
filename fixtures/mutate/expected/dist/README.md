# @jcoreio/mutate

[![Build Status](https://travis-ci.org/jcoreio/mutate.svg?branch=master)](https://travis-ci.org/jcoreio/mutate)
[![Coverage Status](https://codecov.io/gh/jcoreio/mutate/branch/master/graph/badge.svg)](https://codecov.io/gh/jcoreio/mutate)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

a few immutable.js-like mutation functions for plain objects

Beware of using Ramda.js! [It always returns a new object, even if nothing changed!](https://github.com/ramda/ramda/issues/2429)

# Usage

```sh
npm install --save @jcoreio/mutate
```

# API

## `setIn(obj: any, path: Iterable<any>, newValue: any): any`

```js
const { setIn } = require('@jcoreio/mutate')
```

Works just like [`setIn` from Immutable.js](https://facebook.github.io/immutable-js/docs/#/setIn)
but operates on nested JS Objects and Arrays.

## `updateIn(obj: any, path: Iterable<any>, [notSetValue: any], updater: (value: any) => any): any`

```js
const { updateIn } = require('@jcoreio/mutate')
```

Works just like [`updateIn` from Immutable.js](https://facebook.github.io/immutable-js/docs/#/setIn)
but operates on nested JS Objects and Arrays.
