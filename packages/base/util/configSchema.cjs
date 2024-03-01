const z = require('zod')

module.exports = z.object({
  cjsBabelEnv: z.record(z.unknown()).optional(),
  esmBabelEnv: z.record(z.unknown()).optional(),
  esWrapper: z.boolean().optional(),
  outputEsm: z.boolean().optional(),
  scripts: z
    .record(
      z.union([
        z.string(),
        z.object({ run: z.function(), description: z.string() }),
      ])
    )
    .optional(),
})
