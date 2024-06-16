import type { Project } from 'ts-morph'
import type { Analysis } from 'ts-unused-exports/lib/types'
import type { BaseOptions } from '~/interfaces'

interface RemoveUnusedExportKeywordsOptions extends Pick<BaseOptions, 'ignore'> {
  project: Project
  analysis: Analysis
}

export async function removeUnusedExportKeywords(_opts: RemoveUnusedExportKeywordsOptions) {
  // ...
}
