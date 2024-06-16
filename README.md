A simple cli to remove unused variables, interface, class in `.ts` files. this cli tool is built on [`ts-unused-exports`](https://github.com/pzavolinsky/ts-unused-exports) and [`ts-morph`](https://github.com/dsherret/ts-morph).

This project is create from the template [vitesse-lite](https://github.com/antfu-collective/vitesse-lite).

## Usage

```
npx ts-housekeeping --entry [entryFilePath]
```

### Full Example

```
npx ts-housekeeping \
--tsconfig "./tsconfig.json" \
--entry "src/main.ts" \
--include "src" \
--exclude "src/*.ts"
```

## CLI Arguments

### --tsconfig

file path of the `tsconfig.json`.

| required | default           |
| -------- | ----------------- |
| false    | `./tsconfig.json` |

### --entry

the entry of your project, all files referenced by the entry directly or indirectly will be preserved. Others files that are unused in the project would be deleted eventually.

| required | default |
| -------- | ------- |
| true     | -       |

### --include

a glob pattern that match files to include, files not matched would be ignored.

| required | default |
| -------- | ------- |
| false    | -       |

### --exclude

a glob pattern that match files to exclude, files matched would be left untouched, which means everything in it is safe.

| required | default |
| -------- | ------- |
| false    | -       |
