import type { Project, SourceFile } from 'ts-morph'
import { assert, log, shouldIgnoreFile } from './helpers'
import type { BaseOptions } from '~/interfaces'

function findAllReferencedFiles(entry: SourceFile, opts: { include?: string[], exclude?: string[] }) {
  const referencedFiles = new Set()
  const queue = [entry]
  while (queue.length > 0) {
    const file = queue.shift()!

    file.getReferencedSourceFiles().forEach((file) => {
      if (!referencedFiles.has(file)) {
        if (shouldIgnoreFile(file.getFilePath(), opts)) {
          return
        }
        referencedFiles.add(file)
        queue.push(file)
      }
    })
  }
  return referencedFiles
}

interface RemoveUnusedFilesOptions extends Omit<BaseOptions, 'tsconfig'> {
  project: Project
}

export async function removeUnusedFiles(opts: RemoveUnusedFilesOptions) {
  const { project, exclude, include, entry } = opts

  const entryFile = project.getSourceFile(entry)

  assert(!!entryFile, `entry file not found: ${entry}`)

  const referencedFiles = findAllReferencedFiles(entryFile, { exclude, include })

  const unusedFiles = project.getSourceFiles()
    .filter(file => !shouldIgnoreFile(file.getFilePath(), { exclude, include }))
    .filter(file => !referencedFiles.has(file))

  unusedFiles.forEach((file) => {
    if (file !== entryFile && !shouldIgnoreFile(file.getFilePath(), { exclude, include })) {
      log('deleting unused file:', file.getFilePath())
      file.delete()
    }
  })
}
