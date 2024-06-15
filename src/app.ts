export interface RemoveUnusedExportsOptions {
  tsconfig: string
  entry: string
  ignore?: string[]
}
export function removeUnusedExports(opts: RemoveUnusedExportsOptions) {
  // ...
  // eslint-disable-next-line no-console
  console.log(opts)
}
