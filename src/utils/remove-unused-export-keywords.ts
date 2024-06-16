import type { Project, SourceFile } from 'ts-morph'
import { EnumDeclaration, FunctionDeclaration, InterfaceDeclaration, Node, TypeAliasDeclaration, VariableDeclaration, ts } from 'ts-morph'

import type { Analysis } from 'ts-unused-exports/lib/types'
import { assert, log, shouldIgnoreFile, warn } from './helpers'
import type { BaseOptions } from '~/interfaces'

/**
 * Removes the export keyword from specified nodes in a TypeScript source file.
 */
async function removeExportKeyword(sourceFile: SourceFile, nodes: ts.Node[]) {
  if (nodes.length === 0) {
    return
  }

  const createTransformer: ts.TransformerFactory<ts.SourceFile> = (context: ts.TransformationContext) => {
    const visitor: ts.Visitor<ts.Node> = (node: ts.Node) => {
      if (nodes.includes(node)) {
        return undefined
      }
      return ts.visitEachChild(node, visitor, context)
    }
    const transformer = (node: ts.SourceFile) => {
      return ts.visitNode(node, visitor)
    }
    return transformer as ts.Transformer<ts.SourceFile>
  }

  const transformedSourceFile = ts.transform(sourceFile.compilerNode, [createTransformer]).transformed[0]
  const printer = ts.createPrinter()

  log('replacing source file:', sourceFile.getFilePath())
  const result = printer.printFile(transformedSourceFile)
  sourceFile.replaceWithText(result)
}

/**
 * Removes the export keyword from the specified file.
 */
async function removeExportKeyWordInFile(filePath: string, analysis: Analysis, project: Project, idx: number, total: number) {
  log(`[${idx}/${total}] removing export keyword from file:`, filePath)

  const exportInfos = analysis[filePath]
  const exportAllNames = exportInfos.map(node => node.exportName)
  const exportNames = exportAllNames.filter(name => name !== 'default')
  const hasDefaultExport = exportNames.length !== exportAllNames.length
  const sourceFile = project.getSourceFile(filePath)

  log('find unused exports:', exportAllNames)

  assert(!!sourceFile, `source file not found: ${filePath}`)

  if (hasDefaultExport) {
    sourceFile.removeDefaultExport()
  }

  const exportSymbols = exportNames
    .map(name => sourceFile.getLocal(name))
    .filter(s => !!s)

  if (exportSymbols.length !== exportNames.length) {
    const names = new Set(exportSymbols.map(s => s.getName()))
    const missingExports = exportNames.filter(name => !names.has(name))
    warn(`mismatched export symbols and export names, missing: `, missingExports)
  }

  const exportKeywords = exportSymbols.map((s) => {
    const declarations = s.getDeclarations()
      .filter((d) => {
        return FunctionDeclaration.isFunctionDeclaration(d)
          || VariableDeclaration.isVariableDeclaration(d)
          || EnumDeclaration.isEnumDeclaration(d)
          || InterfaceDeclaration.isInterfaceDeclaration(d)
          || TypeAliasDeclaration.isTypeAliasDeclaration(d)
      })

    const nodes = declarations.map(d => d.getExportKeyword()).filter(Node.isNode).map(n => n.compilerNode)
    return nodes
  }).flat()

  await removeExportKeyword(sourceFile, exportKeywords)
}

interface RemoveUnusedExportKeywordsOptions extends Pick<BaseOptions, 'exclude' | 'include'> {
  project: Project
  analysis: Analysis
}

export async function removeUnusedExportKeywords(opts: RemoveUnusedExportKeywordsOptions) {
  const { analysis, project, exclude, include } = opts
  const { unusedFiles, ...restAnalysis } = analysis
  const removePromise = Object.keys(restAnalysis)
    .filter(file => !shouldIgnoreFile(file, { exclude, include }))
    .map((filePath, idx, self) => {
      return removeExportKeyWordInFile(filePath, restAnalysis, project, idx + 1, self.length)
    })
  await Promise.all(removePromise)
}
