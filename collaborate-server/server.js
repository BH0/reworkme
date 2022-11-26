const WebSocket = require("ws")
const wss = new WebSocket.Server({port: 8080})
wss.on("connection", function connection(socket) {
    socket.on("message", async message => {
        wss.clients.forEach(client => {
            if (client !== socket && client.readyState === WebSocket.OPEN) {
                const parsed = JSON.parse(message)
                if (parsed.topic == "request-update-sections") {
                    let data = {
                        topic: "response-update-sections", 
                        content: parsed.content
                    }
                    client.send(JSON.stringify(data))
                }
            }            
        })
    })
})

// Copied the following webserver-code to make deployment via Ngrok is easier  (e.g. no cors issue)
// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework 
const fs = require('fs')
const http = require('http')
const path = require('path')

const PORT = 8000;

const MIME_TYPES = {
  default: 'application/octet-stream',
  html: 'text/html; charset=UTF-8',
  js: 'application/javascript; charset=UTF-8',
  css: 'text/css',
  png: 'image/png',
  jpg: 'image/jpg',
  gif: 'image/gif',
  ico: 'image/x-icon',
  svg: 'image/svg+xml',
};

const BUILD_PATH = path.join(process.cwd(), './build');

const toBool = [() => true, () => false];

const prepareFile = async (url) => {
  const paths = [BUILD_PATH, url];
  if (url.endsWith('/')) paths.push('index.html');
  const filePath = path.join(...paths);
  const pathTraversal = !filePath.startsWith(BUILD_PATH);
  const exists = await fs.promises.access(filePath).then(...toBool);
  const found = !pathTraversal && exists;
  const streamPath = found ? filePath : BUILD_PATH + '/404.html';
  const ext = path.extname(streamPath).substring(1).toLowerCase();
  const stream = fs.createReadStream(streamPath);
  return { found, ext, stream };
};

http.createServer(async (req, res) => {
  const file = await prepareFile(req.url);
  const statusCode = file.found ? 200 : 404;
  const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
  res.writeHead(statusCode, { 'Content-Type': mimeType });
  file.stream.pipe(res);
  console.log(`${req.method} ${req.url} ${statusCode}`);
}).listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);