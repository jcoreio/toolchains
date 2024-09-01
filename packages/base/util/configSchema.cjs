const z = require('zod')

module.exports = z.object({
  cjsBabelEnv: z.record(z.unknown()).optional(),
  esmBabelEnv: z.record(z.unknown()).optional(),
  esWrapper: z.boolean().optional(),
  outputEsm: z.boolean().optional(),
  hasTypeScriptSources: z.boolean().optional(),
  buildIgnore: z.array(z.string()).optional(),
  sourceMaps: z
    .union([
      /**
       * Will output source maps as separate .map files on disk
       */
      z.boolean(),
      z.enum([
        /**
         * Will output inline source maps in transpiled code
         * (except for TypeScript declaration maps, which can only be separate files)
         */
        'inline',
        /**
         * Will output both .map files and inline source maps
         */
        'both',
      ]),
    ])
    .default(true),
  scripts: z
    .record(
      z.union([
        z.string(),
        z.object({ run: z.function(), description: z.string() }),
      ])
    )
    .optional(),
})
