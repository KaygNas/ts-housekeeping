import cac from 'cac'
import zod from 'zod'
import { version } from '../package.json'
import { removeUnused } from './app'

const cli = cac()

cli
  .option('--tsconfig <tsconfig>', 'Path to tsconfig.json', {
    default: './tsconfig.json',
  })
  .option('--entry <entry>', 'Entry files')
  .option('--ignore [...ignore]', 'Ignore files', { default: [] })

cli.help()
cli.version(version)

const parsed = cli.parse()

const schema = zod.object({
  entry: zod.string({ message: 'entry is required' }),
  tsconfig: zod.string({ message: 'tsconfig is required' }),
  ignore: zod.array(zod.string(), { message: 'ignore must be an array' }),
})

const opts = {
  tsconfig: parsed.options.tsconfig,
  entry: parsed.options.entry,
  ignore: parsed.options.ignore,
}

schema.safeParseAsync(opts).then((opts) => {
  if (opts.success) {
    removeUnused(opts.data)
  }
  else {
    opts.error.errors.forEach((error) => {
      console.error(`[${error.code}] ${error.path}: ${error.message}`)
    })
  }
})
