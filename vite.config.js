import { defineConfig, loadEnv } from 'vite';
import * as path from 'path';
import cleanPlugin from 'vite-plugin-clean';

/**
 * Vite configuration file.
 *
 * @param {Object} param0 - The configuration parameters.
 * @param {string} param0.command - The command being run.
 * @param {string} param0.mode - The mode in which Vite is running.
 * @returns {Object} The Vite configuration object.
 */
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production';
  const env = loadEnv(mode, process.cwd(), '');

  return {
    publicDir: 'public',
    base: './',
    build: {
      manifest: true,
      target: 'es2020',
      emptyOutDir: true,
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true,
      lib: {
        entry: path.resolve(__dirname, 'src/main.entry.ts'),
        name: 'Typo3FluidToStorybook', // Global variable name for UMD/IIFE builds
        formats: ['es', 'umd'], // Generate ES and UMD formats
        fileName: (format) => `main.${format}.js`, // Output as main.es.js and main.umd.js
      },
      rollupOptions: {
        // Externalize peer dependencies if any (none specified for this library yet)
        // external: [],
        output: {
          // Provide global variables to use in the UMD build
          // for externalized deps if any
          // globals: {},
          // The following manualChunks, entryFileNames, chunkFileNames might conflict or be
          // overridden by the lib mode. For library mode, it's simpler.
          // We'll remove them for now to let lib mode dictate output structure.
        },
      },
      outDir: path.resolve(__dirname, 'dist'),
      dynamicImportVarsOptions: {
        exclude: [],
      },
      sourcemap: !isProduction,
      treeshake: {
        moduleSideEffects: false,
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'), // Point @ to src directory
      },
    },
    define: {
      'process.env': env,
    },
    plugins: [cleanPlugin()],
  };
});
