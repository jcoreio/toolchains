const semver = require('semver')
const YAML = require('yaml')

module.exports = function trustedPublishingCodemod(config) {
  config = config.replace(/cimg\/node:(\d+\.\d+\.\d+)/, (match, version) => {
    return semver.gte(version, '24.14.1') ? match : `cimg/node:24.14.1`
  })

  const parsed = YAML.parseDocument(config, { keepSourceTokens: true })

  const steps = parsed.getIn(['jobs', 'build', 'steps'])
  if (steps instanceof YAML.YAMLSeq) {
    for (let i = steps.items.length - 1; i >= 0; i--) {
      const step = steps.items[i]
      if (!(step instanceof YAML.YAMLMap)) continue
      const run = step.get('run')
      if (!(run instanceof YAML.YAMLMap)) continue
      const commandItem = run.items.find((i) => i.key.value === 'command')
      if (!commandItem) return false
      const command = commandItem.value.value
      if (
        command.includes('npm config set') &&
        command.includes('_authToken=$NPM_TOKEN')
      ) {
        steps.delete(i)
      }
      if (command.startsWith('pnpm install')) {
        const newCommand = new YAML.Scalar(
          `env "npm_config_//registry.npmjs.org/:_authToken=$NPM_TOKEN" ${command}`
        )
        newCommand.type = 'BLOCK_LITERAL'
        commandItem.value = newCommand
      }
    }
  }

  const workflows = parsed.get('workflows')
  if (workflows instanceof YAML.YAMLMap) {
    for (const workflow of workflows.items) {
      if (!(workflow.value instanceof YAML.YAMLMap)) continue
      const jobs = workflow.value.get('jobs')
      if (!(jobs instanceof YAML.YAMLSeq)) continue
      for (const job of jobs.items) {
        if (!(job instanceof YAML.YAMLMap)) continue
        for (const item of job.items) {
          if (!(item.value instanceof YAML.YAMLMap)) continue
          const context = item.value.get('context')
          if (!(context instanceof YAML.YAMLSeq)) continue
          for (let i = 0; i < context.items.length; i++) {
            const item = context.get(i)
            if (item === 'npm-release') {
              context.set(i, 'npm-readonly')
            }
          }
        }
      }
    }
  }

  return parsed.toString({ lineWidth: 0 })
}
