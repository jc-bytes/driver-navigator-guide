import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { build } from "vite";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.resolve(process.argv[2] || path.join(projectRoot, "github-pages-dist"));
const publicUrl = new URL(process.argv[3] || "https://jc-bytes.github.io/driver-navigator-guide/");

if (!publicUrl.pathname.endsWith("/")) publicUrl.pathname += "/";

await rm(outputDirectory, { recursive: true, force: true });
await build({
  root: path.join(projectRoot, "static-entry"),
  base: "./",
  publicDir: path.join(projectRoot, "public"),
  plugins: [react()],
  build: {
    outDir: outputDirectory,
    emptyOutDir: true,
  },
});

await mkdir(outputDirectory, { recursive: true });
const notFound = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Guide moved</title><meta http-equiv="refresh" content="0;url=${publicUrl.href}"></head><body><p><a href="${publicUrl.href}">Open the Driver and Navigator guide</a></p></body></html>\n`;

await Promise.all([
  writeFile(path.join(outputDirectory, "404.html"), notFound),
  writeFile(path.join(outputDirectory, ".nojekyll"), ""),
]);

console.log(`Exported GitHub Pages site to ${outputDirectory}`);
