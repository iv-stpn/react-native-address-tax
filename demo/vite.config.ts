import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Vite config for the web demo. React Native components run in the browser via
// react-native-web: every `react-native` import is aliased to `react-native-web`,
// and RN's `__DEV__`/`process.env` globals are defined so the RN runtime is happy.
// `mode` (from Vite) stands in for NODE_ENV so the config never touches process.env.
export default defineConfig(({ mode }) => ({
  root: import.meta.dirname,
  plugins: [react()],
  define: {
    __DEV__: JSON.stringify(mode !== 'production'),
    'process.env.NODE_ENV': JSON.stringify(mode),
    global: 'window',
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
    extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.js', '.js'],
  },
  optimizeDeps: {
    include: ['react-native-web'],
    esbuildOptions: {
      resolveExtensions: ['.web.js', '.js', '.ts', '.tsx'],
      loader: { '.js': 'jsx' },
    },
  },
}));
