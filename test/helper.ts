import { join } from 'node:path'
import type { Project, SourceFileCreateOptions } from 'ts-morph'
import prettier from 'prettier'

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

/**
 * format code using prettier
 */
export async function formatCode(code: string): Promise<string> {
  return prettier.format(code, { parser: 'typescript' })
}
