---
"react-native-address-tax": patch
---

Generate type declarations with `tsc` instead of tsup's bundled
`rollup-plugin-dts`, which crashes against the TypeScript 7 native compiler
(`Cannot read properties of undefined (reading 'useCaseSensitiveFileNames')`).

The build now runs `tsup` (JS only) followed by `tsc --emitDeclarationOnly`.
Since `tsc` emits a single `.d.ts` per module, each subpath export collapses to
one flat `types` condition serving both `import` and `require`. No consumer-facing
API change.
