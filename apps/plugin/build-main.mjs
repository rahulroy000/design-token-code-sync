
import { build } from "esbuild";
import { readFileSync } from "node:fs";

const html = readFileSync("dist/index.html", "utf8");

await build({
  entryPoints: ["src/code.ts"],
  bundle: true,
  outfile: "dist/code.js",
  platform: "browser",
  target: "es2020",
  format: "iife",
  define: {
    __html__: JSON.stringify(html)
  }
});

console.log("Figma plugin main thread built successfully.");
