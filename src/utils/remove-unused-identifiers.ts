import type { Project } from 'ts-morph'
import { shouldIgnoreFile } from './helpers'
import type { BaseOptions } from '~/interfaces'

interface RemoveUnusedIdentifiersOptions extends Pick<BaseOptions, 'ignore'> {
  project: Project
}

export async function removeUnusedIdentifiers(opts: RemoveUnusedIdentifiersOptions) {
  const { project, ignore } = opts
  const sourceFiles = project.getSourceFiles().filter(file => !shouldIgnoreFile(file.getFilePath(), ignore))
  sourceFiles.forEach((file) => {
    file.fixUnusedIdentifiers()

    let lastText = ''
    let currText = file.getFullText()
    while (currText && currText !== lastText) {
      lastText = currText
      currText = file.fixUnusedIdentifiers().getFullText()
    }
  })

  await project.save()
}
