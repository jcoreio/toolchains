const z = require('zod')

module.exports = z.object({
  cjsBabelEnv: z.record(z.unknown()).optional(),
  esmBabelEnv: z.record(z.unknown()).optional(),
  esWrapper: z.boolean().optional(),
})
