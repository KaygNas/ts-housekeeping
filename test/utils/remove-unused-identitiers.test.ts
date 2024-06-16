import { formatCode, joinTestCasePath, makeCreateSourceFile } from 'test/helper'
import { Project } from 'ts-morph'
import { describe, expect, it } from 'vitest'
import { removeUnusedIdentifiers } from '~/utils/remove-unused-identifiers'

describe('removeUnusedIdentifiers', () => {
  const project = new Project({
    tsConfigFilePath: './tsconfig.json',
  })
  const createSourceFile = makeCreateSourceFile(project)

  it('should not remove used vars', async () => {
    const FILE_NAME = joinTestCasePath('unused-vars.ts')
    const sourceFile = createSourceFile(FILE_NAME, 'export const a = 1; console.log(a);')

    removeUnusedIdentifiers({ project })

    const result = await formatCode(sourceFile.getFullText())
    const expected = await formatCode('export const a = 1; console.log(a);')

    expect(result).toBe(expected)
  })

  it('should remove unused vars', async () => {
    const FILE_NAME = joinTestCasePath('unused-vars.ts')
    const sourceFile = createSourceFile(FILE_NAME, 'export const a = 1; const b = 2;')

    removeUnusedIdentifiers({ project })

    const result = await formatCode(sourceFile.getFullText())
    const expected = await formatCode('export const a = 1;')

    expect(result).toBe(expected)
  })

  it('should remove recursively unused vars', async () => {
    const FILE_NAME = joinTestCasePath('unused-recursively-vars.ts')
    const sourceFile = createSourceFile(FILE_NAME, 'export const a = 1; const b = a + 1; const c = b + 1; function d() { return c + 1; }')

    removeUnusedIdentifiers({ project })

    const result = await formatCode(sourceFile.getFullText())
    const expected = await formatCode('export const a = 1;')

    expect(result).toBe(expected)
  })
})
