import { Project } from 'ts-morph'
import tsUnusedExports from 'ts-unused-exports'
import type { BaseOptions } from './interfaces'
import { removeUnusedExportKeywords } from './utils/remove-unused-export-keywords'
import { removeUnusedIdentifiers } from './utils/remove-unused-identifiers'
import { removeUnusedFiles } from './utils/remove-unused-files'

const analyze = tsUnusedExports

interface RemoveUnusedOptions extends BaseOptions { }
export async function removeUnused(opts: RemoveUnusedOptions) {
  const { entry, ignore, tsconfig } = opts
  const project = new Project({ tsConfigFilePath: tsconfig })
  const analysis = analyze(tsconfig)
  await removeUnusedExportKeywords({ ignore, analysis, project })
  await removeUnusedIdentifiers({ entry, ignore, project })
  await removeUnusedFiles({ entry, ignore, project })
}
