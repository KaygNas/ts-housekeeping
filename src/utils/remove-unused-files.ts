import type { Project } from 'ts-morph'
import type { BaseOptions } from '~/interfaces'

interface RemoveUnusedFilesOptions extends Omit<BaseOptions, 'tsconfig'> {
  project: Project
}

export async function removeUnusedFiles(_opts: RemoveUnusedFilesOptions) {
  // ...
}
