import { formatCode, joinTestCasePath, makeCreateSourceFile } from 'test/helper'
import { Project } from 'ts-morph'
import type { Analysis } from 'ts-unused-exports/lib/types'
import { describe, expect, it } from 'vitest'
import { removeUnusedExportKeywords } from '~/utils/remove-unused-export-keywords'

type ExportName = Analysis[string][number]
function createExportNames(exportNames: string[]): ExportName[] {
  return exportNames.map(exportName => ({
    exportName,
    location: { character: 0, line: 0 },
  }))
}

describe('removeUnusedExportKeywords', () => {
  describe('variable', () => {
    const project = new Project({
      tsConfigFilePath: './tsconfig.json',
    })
    const createSourceFile = makeCreateSourceFile(project)
    createSourceFile(
      joinTestCasePath('index.ts'),
      `import { hello } from './hello';
      console.log(hello);
    `,
    )
    it('should not remove export for variable if its used in some other file', async () => {
      const FILE_NAME = joinTestCasePath('hello.ts')
      const file = createSourceFile(
        FILE_NAME,
      `export const hello = 'hello';`,
      )
      const analysis: Analysis = {}

      await removeUnusedExportKeywords({ project, analysis })

      const result = file.getFullText()

      expect(result.trim()).toBe(`export const hello = 'hello';`)
    })

    it('should remove export for variable if its not used in some other file', async () => {
      const FILE_NAME = joinTestCasePath('world.ts')
      const file = createSourceFile(
        FILE_NAME,
        `export const world = 'world';`,
      )
      const analysis: Analysis = {
        [FILE_NAME]: createExportNames(['world']),
      }

      await removeUnusedExportKeywords({ project, analysis })

      const result = file.getFullText()

      expect(result.trim()).toBe(`const world = 'world';`)
    })

    it('should remove default exports', async () => {
      const FILE_NAME = joinTestCasePath('default-world.ts')
      const file = createSourceFile(
        FILE_NAME,
        `const world = 'world'; export default world;`,
      )

      const analysis: Analysis = {
        [FILE_NAME]: createExportNames(['default']),
      }

      await removeUnusedExportKeywords({ project, analysis })

      const result = file.getFullText()

      expect(result.trim()).toBe(`const world = 'world';`)
    })
  })

  describe('function', () => {
    const project = new Project({
      tsConfigFilePath: './tsconfig.json',
    })
    const createSourceFile = makeCreateSourceFile(project)
    createSourceFile(
      joinTestCasePath('index.ts'),
      `import { hello } from './hello';
      hello();
    `,
    )
    it('should not remove export for function if its used in some other file', async () => {
      const FILE_NAME = joinTestCasePath('hello.ts')
      const file = createSourceFile(
        FILE_NAME,
      `export const hello = () => 'hello';`,
      )
      const analysis: Analysis = {}

      await removeUnusedExportKeywords({ project, analysis })

      const result = file.getFullText()

      expect(result.trim()).toBe(`export const hello = () => 'hello';`)
    })

    it('should remove export for function if its not used in some other file', async () => {
      const FILE_NAME = joinTestCasePath('world.ts')
      const file = createSourceFile(
        FILE_NAME,
        `export const world = () => 'world';`,
      )
      const analysis: Analysis = {
        [FILE_NAME]: createExportNames(['world']),
      }

      await removeUnusedExportKeywords({ project, analysis })

      const result = file.getFullText()

      expect(result.trim()).toBe(`const world = () => 'world';`)
    })

    it('should remove default exports', async () => {
      const FILE_NAME = joinTestCasePath('default-world.ts')
      const file = createSourceFile(
        FILE_NAME,
        `const world = () => 'world'; export default world;`,
      )

      const analysis: Analysis = {
        [FILE_NAME]: createExportNames(['default']),
      }

      await removeUnusedExportKeywords({ project, analysis })

      const result = file.getFullText()

      expect(result.trim()).toBe(`const world = () => 'world';`)
    })
  })

  describe('interface', () => {
    const project = new Project({
      tsConfigFilePath: './tsconfig.json',
    })
    const createSourceFile = makeCreateSourceFile(project)
    createSourceFile(
      joinTestCasePath('index.ts'),
      `import { Hello } from './hello';
      const hello: Hello = 'hello';
    `,
    )
    it('should not remove export for interface if its used in some other file', async () => {
      const FILE_NAME = joinTestCasePath('hello.ts')
      const file = createSourceFile(
        FILE_NAME,
      `export interface Hello extends String { };`,
      )
      const analysis: Analysis = {}

      await removeUnusedExportKeywords({ project, analysis })

      const result = await formatCode(file.getFullText())
      const expected = await formatCode(`export interface Hello extends String { };`)

      expect(result).toBe(expected)
    })

    it('should remove export for interface if its not used in some other file', async () => {
      const FILE_NAME = joinTestCasePath('world.ts')
      const file = createSourceFile(
        FILE_NAME,
        `export interface World extends String { };`,
      )
      const analysis: Analysis = {
        [FILE_NAME]: createExportNames(['World']),
      }

      await removeUnusedExportKeywords({ project, analysis })

      const result = await formatCode(file.getFullText())
      const expected = await formatCode(`interface World extends String { };`)

      expect(result).toBe(expected)
    })

    it('should remove export for multiple interface if its not used in some other file', async () => {
      const FILE_NAME = joinTestCasePath('world.ts')
      const file = createSourceFile(
        FILE_NAME,
        `interface World extends String { }; export interface World { type: string };`,
      )
      const analysis: Analysis = {
        [FILE_NAME]: createExportNames(['World']),
      }

      await removeUnusedExportKeywords({ project, analysis })

      const result = await formatCode(file.getFullText())
      const expected = await formatCode(`interface World extends String { }; interface World { type: string; };`)

      expect(result).toBe(expected)
    })
  })

  describe('options', () => {
    const project = new Project({
      tsConfigFilePath: './tsconfig.json',
    })
    const createSourceFile = makeCreateSourceFile(project)
    createSourceFile(
      joinTestCasePath('index.ts'),
      `import { hello } from './hello';
      console.log(hello);
    `,
    )

    it('should ignore matched files', async () => {
      const FILE_NAME = joinTestCasePath('world.ts')
      const file = createSourceFile(
        FILE_NAME,
        `export const world = 'world';`,
      )
      const analysis: Analysis = {
        [FILE_NAME]: createExportNames(['world']),
      }

      await removeUnusedExportKeywords({ project, analysis, exclude: ['**/world.ts'] })

      const result = await formatCode(file.getFullText())
      const expected = await formatCode(`export const world = 'world';`)
      expect(result).toBe(expected)
    })

    it('should not ignore unmatched files', async () => {
      const FILE_NAME = joinTestCasePath('world-unmatched.ts')
      const file = createSourceFile(
        FILE_NAME,
        `export const world = 'world';`,
      )
      const analysis: Analysis = {
        [FILE_NAME]: createExportNames(['world']),
      }

      await removeUnusedExportKeywords({ project, analysis, exclude: ['**/world.ts'] })

      const result = await formatCode(file.getFullText())
      const expected = await formatCode(`const world = 'world';`)
      expect(result).toBe(expected)
    })
  })
})
