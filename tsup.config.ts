import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/components/AddressInput.tsx',
    'src/components/AddressTaxInput.tsx',
    'src/components/types.ts',
    'src/validation.ts',
    'src/codes.ts',
    'src/tax.ts',
  ],
  format: ['cjs', 'esm'],
  // Declarations are emitted by `tsc --emitDeclarationOnly` (see the build
  // script). tsup's rollup-plugin-dts is incompatible with the TypeScript 7
  // native compiler API, so we let tsc own .d.ts generation.
  dts: false,
  sourcemap: false,
  clean: true,
  external: ['react', 'react-dom', 'react-native', 'react-native-web'],
  treeshake: true,
  minify: false,
});
