import type { Project } from 'ts-morph'
import { log, shouldIgnoreFile } from './helpers'
import type { BaseOptions } from '~/interfaces'

interface RemoveUnusedIdentifiersOptions extends Pick<BaseOptions, 'exclude' | 'include'> {
  project: Project
}

export async function removeUnusedIdentifiers(opts: RemoveUnusedIdentifiersOptions) {
  log('[start] removing unused identifiers...')

  const { project, exclude, include } = opts
  const sourceFiles = project.getSourceFiles().filter(file => !shouldIgnoreFile(file.getFilePath(), { exclude, include }))
  sourceFiles.forEach((file, idx, self) => {
    log(`[${idx + 1}/${self.length}] removing unused identifiers:`, file.getFilePath())

    let lastText = ''
    let currText = file.getFullText()
    while (currText && currText !== lastText) {
      lastText = currText
      currText = file.fixUnusedIdentifiers().getFullText()
    }
  })

  log('[finished] unused identifiers removed.')
}
