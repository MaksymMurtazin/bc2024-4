const http = require('http');
const path = require('path');
const fs = require('fs').promises;
const { Command } = require('commander');

const program = new Command();
program
  .option('-h, --host <type>', 'адреса сервера')
  .option('-p, --port <number>', 'порт сервера')
  .option('-c, --cache <path>', 'шлях до кеш-директорії');

program.parse(process.argv);

const options = program.opts();
const cacheDir = path.resolve(options.cache);
const host = options.host;
const port = options.port;
const cache = options.cache;

if (!host || !port || !cache) {
  console.error('Помилка: не задано обов`язкові параметри --host, --port та --cache.');
  process.exit(1);
}

const server = http.createServer(async (req, res) => {
  const statusCode = req.url.slice(1);
  const filePath = path.join(cacheDir, `${statusCode}.jpg`);

  if (req.method === 'GET') {
    try {
      const fileData = await fs.readFile(filePath);
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(fileData);
    } catch (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Картинка не знайдена в кеші.\n');
    }
  } else if (req.method === 'PUT') {
    let body = [];
    req.on('data', chunk => body.push(chunk));
    req.on('end', async () => {
      const fileData = Buffer.concat(body);
      try {
        await fs.writeFile(filePath, fileData);
        res.writeHead(201, { 'Content-Type': 'text/plain' });
        res.end('Картинка збережена у кеш.\n');
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Не вдалося зберегти картинку.\n');
      }
    });
  } else if (req.method === 'DELETE') {
    try {
      await fs.unlink(filePath);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Картинка видалена з кешу.\n');
    } catch (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Картинка не знайдена для видалення.\n');
    }
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Метод не дозволено.\n');
  }
});

server.listen(options.port, options.host, () => {
  console.log(`Сервер запущено на http://${options.host}:${options.port}`);
});
