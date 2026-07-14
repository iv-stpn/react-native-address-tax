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
  dts: true,
  sourcemap: false,
  clean: true,
  external: ['react', 'react-dom', 'react-native', 'react-native-web'],
  treeshake: true,
  minify: false,
});
