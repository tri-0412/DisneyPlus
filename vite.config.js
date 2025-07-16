/* eslint-disable no-undef */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/vidsrc": {
        target: "https://vidsrc.xyz",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/vidsrc/, ""),
      },
      "/2embed": {
        target: "https://www.2embed.cc",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/2embed/, ""),
      },
      "/player4u": {
        target: "https://player4u.xyz",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/player4u/, ""),
      },
      "/cloudnestra.com": {
        target: "https://cloudnestra.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cloudnestra\.com/, ""),
      },
      "/9animetv": {
        target: "https://9animetv.to",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/9animetv/, ""),
      },
    },
  },
});
