import { join } from 'node:path'
import { cwd } from 'node:process'
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

function parsePath(input: string) {
  return join(cwd(), input)
}

delete parsed.options['--']

const inputOpts = {
  ...parsed.options,
  tsconfig: parsed.options.tsconfig,
  entry: parsePath(parsed.options.entry),
  include: parseArrayInput(parsed.options.include).map(parsePath),
  exclude: parseArrayInput(parsed.options.exclude).map(parsePath),
}

const schema = zod.object({
  entry: zod.string({ message: 'entry is required' }),
  tsconfig: zod.string({ message: 'tsconfig is required' }),
  include: zod.array(zod.string(), { message: 'include must be an array' }),
  exclude: zod.array(zod.string(), { message: 'exclude must be an array' }),
}).strict()

schema.safeParseAsync(inputOpts).then(async (opts) => {
  if (opts.success) {
    log('[start] removing unused...')
    log('inputOpts:', opts.data)
    await removeUnused(opts.data)
    log('[finished] all used are removed.')
  }
  else {
    opts.error.errors.forEach((error) => {
      console.error(`[${error.code}] ${error.path}: ${error.message}.`)
    })
  }
})
