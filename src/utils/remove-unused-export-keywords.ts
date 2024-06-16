import type { Project, SourceFile } from 'ts-morph'
import { Node, ts } from 'ts-morph'

import type { Analysis } from 'ts-unused-exports/lib/types'
import { assert, log, shouldIgnoreFile } from './helpers'
import type { BaseOptions } from '~/interfaces'

/**
 * Removes the export keyword from specified nodes in a TypeScript source file.
 */
async function removeExportKeyword(sourceFile: SourceFile, nodes: ts.Node[]) {
  if (nodes.length === 0) {
    return
  }

  const transformer = (context: ts.TransformationContext) => {
    return (node: ts.SourceFile) => {
      const visitor = (node: ts.Node) => {
        if (nodes.includes(node) && node.kind === ts.SyntaxKind.ExportKeyword) {
          return undefined
        }

        return ts.visitEachChild(node, visitor, context)
      }

      return ts.visitNode(node, visitor)
    }
  }

  log('replacing source file:', sourceFile.getFilePath())

  const transformedSourceFile = ts.transform(sourceFile.compilerNode, [transformer]).transformed[0]
  const printer = ts.createPrinter()
  const result = printer.printFile(transformedSourceFile)
  sourceFile.replaceWithText(result)
}

/**
 * Removes the export keyword from the specified file.
 */
async function removeExportKeyWordInFile(filePath: string, analysis: Analysis, project: Project, idx: number, total: number) {
  log(`[${idx}/${total}] removing export keyword from file:`, filePath)

  const exportInfos = analysis[filePath]
  const exportNames = new Set(exportInfos.map(node => node.exportName))
  const sourceFile = project.getSourceFile(filePath)

  assert(!!sourceFile, `source file not found: ${filePath}`)

  const declarations = Array.from(sourceFile.getExportedDeclarations().entries())

  log('find declarations:', declarations.length)

  const unusedExports = declarations
    .filter(([name]) => {
      return exportNames.has(name)
    })
    .map(([name, declarations]) => {
      const declaration = declarations[0]
      const node = declaration.getFirstDescendantByKind(ts.SyntaxKind.ExportKeyword)?.compilerNode
      return { name, node }
    })
    .filter(({ node }) => node !== undefined)

  log('find unused exports:', unusedExports.map(({ name }) => name))

  const unusedExportsNodes = unusedExports.map(({ node }) => node).filter(node => Node.isNode(node))
  await removeExportKeyword(sourceFile, unusedExportsNodes)
}

interface RemoveUnusedExportKeywordsOptions extends Pick<BaseOptions, 'ignore'> {
  project: Project
  analysis: Analysis
}

export async function removeUnusedExportKeywords(opts: RemoveUnusedExportKeywordsOptions) {
  const { analysis, project, ignore } = opts
  const { unusedFiles, ...restAnalysis } = analysis
  const removePromise = Object.keys(restAnalysis)
    .filter(file => shouldIgnoreFile(file, ignore))
    .map((filePath, idx, self) => {
      return removeExportKeyWordInFile(filePath, restAnalysis, project, idx + 1, self.length)
    })
  await Promise.all(removePromise)
}
