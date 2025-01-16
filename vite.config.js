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
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'src/js/main.entry.js'),
        },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return id
                .toString()
                .split('node_modules/')[1]
                .split('/')[0]
                .toString();
            }
          },
          entryFileNames: 'src/js/[name].js',
          chunkFileNames: 'src/js/[name]-[hash].js',
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
        '@': path.resolve(__dirname, 'src/js'),
      },
    },
    define: {
      'process.env': env,
    },
    plugins: [cleanPlugin()],
  };
});
