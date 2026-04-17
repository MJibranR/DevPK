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
    build: {
      outDir: "dist/client",
      emptyOutDir: true
    },
    plugins: [
      {
        name: "create-client-index-html",
        enforce: "post",
        apply: "build",
        writeBundle() {
          const clientDir = path.join("dist/client", "client");
          const manifestPath = path.join("dist/client", "server", ".vite", "manifest.json");
          const indexPath = path.join(clientDir, "index.html");
          
          if (!fs.existsSync(clientDir)) {
            fs.mkdirSync(clientDir, { recursive: true });
          }
          
          let entryScript = "/assets/index-CziVUOGr.js"; // fallback
          
          try {
            if (fs.existsSync(manifestPath)) {
              const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
              const entryKey = Object.keys(manifest).find(key => key.includes("src/main"));
              if (entryKey && manifest[entryKey]?.file) {
                entryScript = `/assets/${manifest[entryKey].file}`;
              }
            }
          } catch (err) {
            console.warn("Could not read manifest, using fallback entry script");
          }
          
          const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DevPK</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${entryScript}"></script>
  </body>
</html>`;
          
          fs.writeFileSync(indexPath, html);
          console.log("✓ Created dist/client/client/index.html");
        }
      }
    ]
  }
});