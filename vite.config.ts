// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
// import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// export default defineConfig();
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import fs from "fs";
import path from "path";

export default defineConfig({
  vite: {
    plugins: [
      {
        name: "generate-spa-index",
        enforce: "post",
        apply: "build",
        writeBundle() {
          const indexPath = path.join("dist/client", "index.html");
          
          // Read the manifest to find the correct entry point
          const manifestPath = path.join("dist/client/server", ".vite", "manifest.json");
          let entryScript = "/assets/index-CziVUOGr.js"; // fallback
          
          try {
            if (fs.existsSync(manifestPath)) {
              const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
              // Find the main entry point
              const mainEntry = manifest["src/main.tsx"];
              if (mainEntry) {
                entryScript = `/assets/${mainEntry.file}`;
              }
            }
          } catch (err) {
            console.warn("Could not read manifest, using fallback");
          }
          
          const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DevPK</title>
    <link rel="stylesheet" href="/assets/styles--z4txV0B.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${entryScript}"></script>
  </body>
</html>`;
          
          fs.writeFileSync(indexPath, html);
          console.log("✓ Generated dist/client/index.html");
        }
      }
    ]
  }
});