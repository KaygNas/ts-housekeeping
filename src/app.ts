import { Project } from 'ts-morph'
import tsUnusedExports from 'ts-unused-exports'
import type { BaseOptions } from './interfaces'
import { removeUnusedExportKeywords } from './utils/remove-unused-export-keywords'
import { removeUnusedIdentifiers } from './utils/remove-unused-identifiers'
import { removeUnusedFiles } from './utils/remove-unused-files'
import { saveProject } from './utils/save-project'

const analyze = (tsUnusedExports as any).default as typeof tsUnusedExports

interface RemoveUnusedOptions extends BaseOptions { }
export async function removeUnused(opts: RemoveUnusedOptions) {
  const { entry, exclude, tsconfig } = opts
  const project = new Project({ tsConfigFilePath: tsconfig })
  const analysis = analyze(tsconfig)
  await removeUnusedExportKeywords({ exclude, analysis, project })
  await removeUnusedIdentifiers({ exclude, project })
  await removeUnusedFiles({ entry, exclude, project })
  await saveProject(project)
}
