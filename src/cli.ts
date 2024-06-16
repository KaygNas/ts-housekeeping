import cac from 'cac'
import zod from 'zod'
import { version } from '../package.json'
import { log } from './utils/helpers'
import { removeUnused } from './app'

const cli = cac()

cli
  .option('--tsconfig <tsconfig>', 'Path to tsconfig.json', {
    default: './tsconfig.json',
  })
  .option('--entry <entry>', 'Entry files')
  .option('--exclude <exclude>', 'Exclude files')
  .option('--include <include>', 'Include files')

cli.help()
cli.version(version)

const parsed = cli.parse()

function parseArrayInput(input: unknown) {
  return (typeof input === 'string' ? input : '').split(',').filter(Boolean)
}

delete parsed.options['--']

const inputOpts = {
  ...parsed.options,
  tsconfig: parsed.options.tsconfig,
  entry: parsed.options.entry,
  include: parseArrayInput(parsed.options.include),
  exclude: parseArrayInput(parsed.options.exclude),
}

const schema = zod.object({
  entry: zod.string({ message: 'entry is required' }),
  tsconfig: zod.string({ message: 'tsconfig is required' }),
  include: zod.array(zod.string(), { message: 'include must be an array' }),
  exclude: zod.array(zod.string(), { message: 'exclude must be an array' }),
}).strict()

schema.safeParseAsync(inputOpts).then(async (opts) => {
  if (opts.success) {
    log('[start] removing used... inputOpts:', opts.data)
    await removeUnused(opts.data)
    log('[finished] removing used.')
  }
  else {
    opts.error.errors.forEach((error) => {
      console.error(`[${error.code}] ${error.path}: ${error.message}.`)
    })
  }
})
