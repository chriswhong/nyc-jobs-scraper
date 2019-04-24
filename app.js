// this is a dummy app so we can deploy this thing using dokku
const http = require('http');

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, World!');
}).listen(5000);
