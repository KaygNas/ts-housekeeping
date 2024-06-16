import { minimatch } from 'minimatch'

export function shouldIgnoreFile(file: string, opts: { exclude?: string[], include?: string[] }): boolean {
  const { exclude, include } = opts
  return !shouldIncludeFile(file, include) || shouldExcludeFile(file, exclude)
}

export function shouldExcludeFile(file: string, exclude: string[] = []): boolean {
  exclude.push('**/node_modules/**')
  return exclude.some(pattern => minimatch(file, pattern))
}

export function shouldIncludeFile(file: string, include: string[] = []): boolean {
  if (include.length === 0) {
    return true
  }
  return include.some(pattern => minimatch(file, pattern))
}

export function log(...args: unknown[]) {
  // eslint-disable-next-line no-console
  console.log(...args)
}

export function warn(...args: unknown[]) {
  console.warn(...args)
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}
