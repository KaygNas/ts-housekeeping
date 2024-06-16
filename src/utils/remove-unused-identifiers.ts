import type { Project } from 'ts-morph'
import type { BaseOptions } from '~/interfaces'

interface RemoveUnusedIdentifiersOptions extends Omit<BaseOptions, 'tsconfig'> {
  project: Project
}

export async function removeUnusedIdentifiers(_opts: RemoveUnusedIdentifiersOptions) {
  // ...
}
