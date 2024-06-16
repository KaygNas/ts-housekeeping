import { minimatch } from 'minimatch'

export function shouldIgnoreFile(file: string, ignore: string[] = []): boolean {
  return ignore.some(pattern => minimatch(file, pattern))
}

export function log(...args: unknown[]) {
  // eslint-disable-next-line no-console
  console.log(...args)
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}
