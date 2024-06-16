import { join } from 'node:path'
import type { Project, SourceFileCreateOptions } from 'ts-morph'

export function joinTestCasePath(path: string) {
  return join(`test/cases`, path)
}

export function makeCreateSourceFile(project: Project) {
  const defaultOptions: SourceFileCreateOptions = {
    overwrite: true,
  }
  const createSourceFile: Project['createSourceFile'] = (filePath, sourceFileText, options) => {
    return project.createSourceFile(filePath, sourceFileText, { ...defaultOptions, ...options })
  }
  return createSourceFile
}
