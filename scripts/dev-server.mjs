#!/usr/bin/env node
// Tiny zero-dependency static server with live-reload (SSE).
// Serves the project root, watches slide source files, and tells the
// browser to refresh whenever you save a change.

import { createServer } from "node:http";
import { createReadStream, readdirSync, statSync, watch } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const PORT = Number(process.env.PORT ?? 8080);
const HOST = process.env.HOST ?? "localhost";
const ROOT = resolve(process.cwd());

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

const RELOAD_SNIPPET = `
<script>
(function () {
  if (window.__revealHotReload) return;
  window.__revealHotReload = true;
  var connect = function () {
    var es = new EventSource("/__reload");
    es.addEventListener("reload", function () { location.reload(); });
    es.onerror = function () { es.close(); setTimeout(connect, 500); };
  };
  connect();
})();
</script>
`;

const sseClients = new Set();

function broadcastReload() {
  for (const res of sseClients) {
    res.write("event: reload\ndata: 1\n\n");
  }
}

let pending = null;
function scheduleBroadcast() {
  if (pending) return;
  pending = setTimeout(() => {
    pending = null;
    broadcastReload();
  }, 80);
}

// Skip dependencies, VCS, editor swap files, and other noise.
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".cache",
  ".vscode",
  ".idea",
  ".qodo",
  "scripts",
]);

const isNoise = (filename) =>
  !filename ||
  filename.endsWith("~") ||
  filename.endsWith(".swp") ||
  filename.startsWith(".#");

function watchPath(target) {
  try {
    const watcher = watch(target, { recursive: true }, (_event, filename) => {
      if (isNoise(filename)) return;
      scheduleBroadcast();
    });
    // Async watcher errors (EMFILE, etc.) must be handled, otherwise Node
    // emits 'error' on the EventEmitter and crashes the whole process.
    // The dev server stays useful even if file watching degrades — the
    // browser just won't auto-reload until the next manual refresh.
    watcher.on("error", (err) => {
      console.warn(`  ! Watch error on ${target}: ${err.message}`);
    });
  } catch (err) {
    console.warn(`  ! Could not watch ${target}: ${err.message}`);
  }
}

// Watch slide source files explicitly...
for (const file of ["index.html", "slides.md"]) {
  try {
    statSync(join(ROOT, file));
    watchPath(join(ROOT, file));
  } catch {
    // File may not exist yet — that's fine.
  }
}

// ...plus any user-created top-level folders (assets, images, etc.).
for (const entry of readdirSync(ROOT, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  if (entry.name.startsWith(".")) continue;
  if (SKIP_DIRS.has(entry.name)) continue;
  watchPath(join(ROOT, entry.name));
}

function safeJoin(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const cleaned = normalize(decoded).replace(/^(\.\.[\/])+/g, "");
  const target = resolve(join(ROOT, cleaned));
  if (!target.startsWith(ROOT)) return null;
  return target;
}

const server = createServer(async (req, res) => {
  if (req.url === "/__reload") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    });
    res.write("retry: 500\n\n");
    sseClients.add(res);
    req.on("close", () => sseClients.delete(res));
    return;
  }

  const urlPath = req.url === "/" ? "/index.html" : req.url;
  let filePath = safeJoin(urlPath);
  if (!filePath) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const stats = statSync(filePath);
    if (stats.isDirectory()) filePath = join(filePath, "index.html");
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
    return;
  }

  const type = MIME[extname(filePath).toLowerCase()] ?? "application/octet-stream";
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", type);

  if (type.startsWith("text/html")) {
    try {
      const html = await readFile(filePath, "utf8");
      const injected = html.includes("</body>")
        ? html.replace("</body>", `${RELOAD_SNIPPET}</body>`)
        : html + RELOAD_SNIPPET;
      res.writeHead(200).end(injected);
    } catch (err) {
      res.writeHead(500).end(`Failed to read ${filePath}: ${err.message}`);
    }
    return;
  }

  res.writeHead(200);
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}`;
  console.log(`\n  ▸ Slides ready at ${url}`);
  console.log(`  ▸ Edit slides.md and the browser will reload automatically.\n`);
});
