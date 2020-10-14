# @jedwards1211/js-react-toolchain

[![CircleCI](https://circleci.com/gh/jedwards1211/js-toolchain.svg?style=svg)](https://circleci.com/gh/jedwards1211/js-toolchain)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm version](https://badge.fury.io/js/%40jedwards1211%2Fjs-react-toolchain.svg)](https://badge.fury.io/js/%40jedwards1211%2Fjs-react-toolchain)

This is my personal skeleton for creating an npm package with JS(/flow) source code.

## Assumptions

- All source files are in `src`
- Test files are in `test`. You can override this by specifying options for mocha in `config.mocha` in your `package.json`.
- You want to publish the package via `semantic-release`
- You're using CircleCI

## Usage

```sh
yarn add --dev @jedwards1211/js-react-toolchain
yarn toolchain bootstrap
```

If you want to more aggressively replace existing configuration, use `yarn toolchain bootstrap --hard`.

The bootstrap script will modify your package.json, .gitignore, .circleci/config.yml and generate .babelrc.js, .eslintrc.js, and .prettierrc.js that are just proxies for the config in `@jedwards1211/js-react-toolchain`.

Instead of running scripts from your `package.json`, you can run them with the `yarn toolchain` command (or `yarn tc`), for example `yarn toolchain lint`. Run `yarn toolchain` by itself
to see all of the available commands.

## Package Publishing

Files to publish are output/copied into the `dist` folder and then published from there. This includes a derived
`package.json` with various development-only fields removed and automatically-generated `main`, `module`, and `exports` fields added.

The toolchain will do the following:

- Transpile `src/**.js` to `dist/**.js` (CommonJS modules)
- Transpile `src/**.js` to `dist/**.mjs` (ES modules)
- Copy `src/**.js` to `dist/**.js.flow`
- Copy `src/**.js.flow` to `dist`
- Copy `src/**.d.ts` to `dist`
- Copy `*.md` to `dist`
- Copy `package.json` to `dist` with modifications:
  - `main` from root `package.json` or auto-generated value
  - `module` from root `package.json` or auto-generated value
  - `exports` from root `package.json` or auto-generated value
  - `@babel/runtime` will be added or removed from `dependencies` depending on whether any output code requires it
  - Removed keys:
    - `config`
    - `devDependencies`
    - `files`
    - `husky`
    - `lint-staged`
    - `nyc`
    - `scripts.prepublishOnly`
    - `renovate`
