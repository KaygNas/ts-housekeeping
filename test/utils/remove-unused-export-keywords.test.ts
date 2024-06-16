import { joinTestCasePath, makeCreateSourceFile } from 'test/helper'
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

  //   it('should not remove export if it has a comment to ignore', () => {
  //     const file = project.createSourceFile(
  //       './tools/remove-unused-code/case/with-comment.ts',
  //       `// ts-remove-unused-skip
  // export const world = 'world';`,
  //     )

  //     removeUnusedVariableExport(file)

  //     const result = file.getFullText()

  //     assert.equal(
  //       result.trim(),
  //       `// ts-remove-unused-skip
  // export const world = 'world';`,
  //     )
  //   })

  //   it('should ignore default exports', () => {
  //     const file = project.createSourceFile(
  //       './tools/remove-unused-code/case/default-world.ts',
  //       `const world = 'world'; export default world;`,
  //     )

  //     removeUnusedVariableExport(file)

  //     const result = file.getFullText()

//     assert.equal(result.trim(), `const world = 'world'; export default world;`)
//   })
})
