import { describe, expect, it } from 'vitest'
import { Project } from 'ts-morph'
import { joinTestCasePath, makeCreateSourceFile } from 'test/helper'
import { removeUnusedFiles } from '~/utils/remove-unused-files'

describe('removeUnusedFiles', () => {
  const project = new Project({
    tsConfigFilePath: './tsconfig.json',
  })
  const createSourceFile = makeCreateSourceFile(project)

  it('should remove unused files', async () => {
    const ENTRY_FILE_NAME = joinTestCasePath('unused-file-index.ts')
    const FILA_A_NAME = joinTestCasePath('unused-file-a.ts')
    const FILE_B_NAME = joinTestCasePath('unused-file-b.ts')
    createSourceFile(ENTRY_FILE_NAME, 'const a = 1; console.log(a);')
    createSourceFile(FILA_A_NAME, 'export const a = 1;')
    createSourceFile(FILE_B_NAME, 'export const b = 2;')

    await removeUnusedFiles({ entry: ENTRY_FILE_NAME, project })

    const entryFile = project.getSourceFile(ENTRY_FILE_NAME)
    const fileA = project.getSourceFile(FILA_A_NAME)
    const fileB = project.getSourceFile(FILE_B_NAME)

    expect(entryFile).toBeDefined()
    expect(fileA).toBeUndefined()
    expect(fileB).toBeUndefined()
  })

  it('should not remove ignored files', async () => {
    const ENTRY_FILE_NAME = joinTestCasePath('unused-file-index.ts')
    const FILA_A_NAME = joinTestCasePath('unused-file-a.ts')
    const FILE_B_NAME = joinTestCasePath('unused-file-b.ts')
    createSourceFile(ENTRY_FILE_NAME, 'const a = 1; console.log(a);')
    createSourceFile(FILA_A_NAME, 'export const a = 1;')
    createSourceFile(FILE_B_NAME, 'export const b = 2;')

    await removeUnusedFiles({ project, entry: ENTRY_FILE_NAME, ignore: ['**/unused-file-a.ts'] })

    const entryFile = project.getSourceFile(ENTRY_FILE_NAME)
    const fileA = project.getSourceFile(FILA_A_NAME)
    const fileB = project.getSourceFile(FILE_B_NAME)

    expect(entryFile).toBeDefined()
    expect(fileA).toBeDefined()
    expect(fileB).toBeUndefined()
  })
})
