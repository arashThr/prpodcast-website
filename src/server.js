import { readFile, stat } from "fs/promises";
import { createServer } from "http";
import * as path from "path";

const distDirName = process.argv[2] ?? "docs";
const dirname = path.dirname(new URL(import.meta.url).pathname);
const staticsDir = path.join(dirname, "..", distDirName);
const port = process.env.PORT ?? 3000;

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpg",
  ".wav": "audio/wav",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".eot": "application/vnd.ms-fontobject",
  ".ttf": "application/font-sfnt",
  ".woff": "application/font-woff",
  ".woff2": "application/font-woff2",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".txt": "text/plain",
};

const getContentType = (ext) => {
  return mimeTypes[ext] ?? "application/octet-stream";
};

const server = createServer(async (req, res) => {
  const configsFile = await readFile(
    path.join(dirname, "../site/configs.json")
  );
  const configs = JSON.parse(configsFile);

  const baseUrl = configs.site.baseurl;
  let fileName = req.url;
  if (req.url.startsWith(baseUrl)) {
    fileName = req.url.substring(baseUrl.length - 1);
  }

  if (fileName.endsWith("/")) {
    fileName += "index.html";
  } else if (!path.extname(fileName)) {
    fileName += ".html";
  }
  const filePath = path.join(staticsDir, fileName);

  try {
    await stat(filePath);
  } catch (err) {
    respond404(res);
    return;
  }

  const ext = path.extname(filePath);
  const contentType = getContentType(ext);

  const data = await readFile(filePath);
  res.writeHead(200, { "Content-Type": contentType });
  res.end(data, "utf8");
});

async function respond404(res) {
  const filePath = path.join(staticsDir, "404.html");
  const data = await readFile(filePath);
  res.writeHead(404, { "Content-Type": "text/html" });
  res.end(data);
}

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
