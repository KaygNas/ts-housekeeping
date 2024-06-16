import type { Project } from 'ts-morph'
import { shouldIgnoreFile } from './helpers'
import type { BaseOptions } from '~/interfaces'

interface RemoveUnusedIdentifiersOptions extends Pick<BaseOptions, 'exclude' | 'include'> {
  project: Project
}

export async function removeUnusedIdentifiers(opts: RemoveUnusedIdentifiersOptions) {
  const { project, exclude, include } = opts
  const sourceFiles = project.getSourceFiles().filter(file => !shouldIgnoreFile(file.getFilePath(), { exclude, include }))
  sourceFiles.forEach((file) => {
    file.fixUnusedIdentifiers()

    let lastText = ''
    let currText = file.getFullText()
    while (currText && currText !== lastText) {
      lastText = currText
      currText = file.fixUnusedIdentifiers().getFullText()
    }
  })
}
