import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin, transformWithEsbuild } from "vite";

const UNTRANSPILED_JSX_MODULES = /node_modules\/react-native-vector-icons\/.*\.js$/;

const untranspiledJsx = (): Plugin => ({
  name: "untranspiled-jsx",
  enforce: "pre",
  transform(code, id) {
    if (!UNTRANSPILED_JSX_MODULES.test(id)) return null;
    return transformWithEsbuild(code, id, { loader: "jsx", jsx: "automatic" });
  },
});

export default defineConfig(({ mode }) => ({
  plugins: [react(), untranspiledJsx()],
  define: {
    __DEV__: JSON.stringify(mode !== "production"),
    global: "globalThis",
  },
  resolve: {
    alias: [
      {
        find: "~",
        replacement: resolve(__dirname, "./src"),
      },
      {
        find: /^react-native$/,
        replacement: resolve(__dirname, "./node_modules/react-native-web"),
      },
    ],
    extensions: [".web.ts", ".web.tsx", ".web.js", ".web.jsx", ".ts", ".tsx", ".js", ".jsx", ".mjs"],
  },
  optimizeDeps: {
    esbuildOptions: {
      resolveExtensions: [".web.js", ".web.jsx", ".web.ts", ".web.tsx", ".mjs", ".js", ".jsx", ".ts", ".tsx", ".json"],
      loader: {
        ".js": "jsx",
      },
      define: {
        global: "globalThis",
        __DEV__: JSON.stringify(mode !== "production"),
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
}));
