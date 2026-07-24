import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

/** Serve the static files in `rootDir` on `port`. */
export function serve(rootDir: string, port: number): void {
  const server = createServer(async (req, res) => {
    try {
      // Strip query string and decode; block path traversal.
      const rawPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
      const safePath = normalize(rawPath).replace(/^(\.\.[/\\])+/, "");
      let filePath = join(rootDir, safePath);

      // Directory -> index.html.
      let info = await stat(filePath).catch(() => null);
      if (info?.isDirectory()) {
        filePath = join(filePath, "index.html");
        info = await stat(filePath).catch(() => null);
      }

      if (!info?.isFile()) {
        res.writeHead(404, { "content-type": "text/plain" });
        res.end("404 Not Found");
        return;
      }

      const body = await readFile(filePath);
      res.writeHead(200, {
        "content-type": MIME[extname(filePath).toLowerCase()] ?? "application/octet-stream",
      });
      res.end(body);
    } catch (err) {
      res.writeHead(500, { "content-type": "text/plain" });
      res.end(`500 Internal Server Error\n${(err as Error).message}`);
    }
  });

  server.listen(port, () => {
    console.log(`Serving ${rootDir} at http://localhost:${port}`);
  });
}
