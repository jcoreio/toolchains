const YAML = require('yaml')
const fs = require('@jcoreio/toolchain/util/projectFs.cjs')

module.exports = async function getTrustedPublishingContexts(config) {
  if (!config) {
    config = YAML.parse(await fs.readFile('.circleci/config.yml', 'utf8'))
  }
  const { jobs, workflows } = config
  const trustedPublishingJobs = Object.keys(jobs).filter((name) => {
    const steps = jobs[name]?.steps
    return (
      Array.isArray(steps) &&
      steps.some(
        (step) =>
          typeof step?.run?.command === 'string' &&
          /\btc release\b/.test(step.run.command)
      )
    )
  })
  const contexts = new Set()
  for (const workflow of Object.values(workflows)) {
    for (const job of workflow.jobs || []) {
      for (const name of trustedPublishingJobs) {
        const jobContext = job?.[name]?.context
        if (Array.isArray(jobContext)) {
          for (const context of jobContext) {
            contexts.add(context)
          }
        }
      }
    }
  }
  return [...contexts]
}

if (require.main === module) {
  module.exports()
}
