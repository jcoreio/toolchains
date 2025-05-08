const { name } = require('../package.json')
const { format } = require('prettier')
const prettierConfig = require('../prettierConfig.cjs')
const { statement, expression, default: template } = require('@babel/template')
const { generate } = require('@babel/generator')
const path = require('path')
const t = require('@babel/types')

const objectExpression = (props) =>
  t.objectExpression(
    Object.entries(props).flatMap(([key, value]) =>
      value ? [t.objectProperty(t.identifier(key), value)] : []
    )
  )

const idOrString = (value) =>
  /^[_a-z$][_a-z0-9$]*$/.test(value) ?
    t.identifier(value)
  : t.stringLiteral(value)

const member = (object, key) => {
  const prop = idOrString(key)
  return t.memberExpression(object, prop, prop.type !== 'Identifier')
}

function isSimpleObjectExpression(obj) {
  return (
    obj &&
    obj.type === 'ObjectExpression' &&
    obj.properties.every(
      (p) =>
        p.type === 'ObjectProperty' &&
        !p.computed &&
        (p.key.type === 'Identifier' || p.key.type === 'StringLiteral')
    )
  )
}

function decodeSimpleObjectExpression(obj) {
  if (!isSimpleObjectExpression(obj)) {
    throw new Error(
      'obj is not an ObjectExpression containing only non-computed identifier- or string-keyed properties'
    )
  }
  return Object.fromEntries(
    obj.properties.map((p) => [
      p.key.type === 'Identifier' ? p.key.name : p.key.value,
      p.value,
    ])
  )
}

async function migrateLegacyEslintConfigs(configs) {
  const body = [
    statement.ast`const { defineConfig } = require('eslint/config')`,
  ]
  const warnings = {}
  let importedGlobals = false

  function importGlobals() {
    if (importedGlobals) return
    body.push(statement.ast`const globals = require('globals')`)
    importedGlobals = true
  }

  const CONFIG = expression.ast(`[...require('${name}/eslintConfig.cjs')]`)
  for (const file of Object.keys(configs).sort()) {
    const content = configs[file]
    function warn(warning) {
      ;(warnings[file] || (warnings[file] = [])).push(warning)
    }
    if (/\.[cm]?js$/.test(file)) {
      const { parse } = require('@babel/parser')
      let parsed
      try {
        parsed = parse(content, { sourceType: 'unambiguous' })
      } catch (error) {
        warn(`parse error: ${error.message}`)
        continue
      }

      const exportStatement = parsed.program.body.find(
        (s) =>
          s.type === 'ExpressionStatement' &&
          s.expression.type === 'AssignmentExpression' &&
          generate(s.expression.left).code === 'module.exports' &&
          s.expression.right.type === 'ObjectExpression'
      )
      if (!exportStatement) {
        warn('module.exports = statement not found')
        continue
      }
      const config = exportStatement.expression.right

      if (!isSimpleObjectExpression(config)) {
        warn(
          'config is not an ObjectExpression or has spread or computed properties'
        )
        continue
      }
      const {
        extends: _extends,
        env: _env,
        rules,
        ...rest
      } = decodeSimpleObjectExpression(config)

      for (const key of Object.keys(rest)) {
        warn(
          `migrating ${generate(member(t.identifier('config'), key)).code} is not currently supported`
        )
      }

      if (_extends) {
        const ext = generate(_extends).code
        if (
          ext !== `[require.resolve('@jcoreio/toolchain/eslintConfig.cjs')]` &&
          ext !== `[require.resolve('@jcoreio/toolchain/eslint.config.cjs')]`
        ) {
          warn(
            `config.extends has entries other than base @jcoreio/toolchain eslint config`
          )
        }
      }
      let env
      if (_env) {
        if (isSimpleObjectExpression(_env)) {
          env = decodeSimpleObjectExpression(_env)
          for (const key in env) {
            if (env[key].type !== 'BooleanLiteral') {
              warn(
                `config.${generate(member(t.identifier('env'), key)).code} is not a boolean`
              )
              delete env[key]
            }
          }
          if (!Object.keys(env).length) env = undefined
        } else {
          warn(
            `config.env is not an ObjectExpression or has spread or computed properties`
          )
        }
      }

      if (!env && !rules) continue

      if (env) importGlobals()

      CONFIG.elements.push(
        objectExpression({
          files:
            path.dirname(file) !== '.' &&
            t.arrayExpression([t.stringLiteral(path.dirname(file) + '/**')]),
          languageOptions:
            env &&
            objectExpression({
              globals: t.objectExpression(
                Object.keys(env).map((key) =>
                  t.spreadElement(member(t.identifier('globals'), key))
                )
              ),
            }),
          rules,
        })
      )
    } else {
      const JSON5 = require('json5')

      const props = JSON5.parse(content)
      const { env, rules, ...rest } = props

      for (const key of Object.keys(rest)) {
        warn(
          `migrating ${generate(member(t.identifier('config'), key)).code} is not currently supported`
        )
      }

      if (!env && !rules) continue

      if (env) importGlobals()

      CONFIG.elements.push(
        objectExpression({
          files:
            path.dirname(file) !== '.' &&
            t.arrayExpression([t.stringLiteral(path.dirname(file) + '/**')]),
          rules: rules && expression.ast(JSON.stringify(rules)),
          languageOptions:
            env &&
            objectExpression({
              globals: t.objectExpression(
                Object.keys(env).map((key) =>
                  t.spreadElement(member(t.identifier('globals'), key))
                )
              ),
            }),
        })
      )
    }
  }

  body.push(template`module.exports = defineConfig(CONFIG)`({ CONFIG }))

  return {
    migrated: await format(
      generate(t.program(body)).code.replace(
        /^module\.exports/m,
        '\nmodule.exports'
      ),
      {
        ...prettierConfig,
        parser: 'babel',
      }
    ),
    warnings,
  }
}

module.exports = migrateLegacyEslintConfigs
