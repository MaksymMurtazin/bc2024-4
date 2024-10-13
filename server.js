const http = require('http');
const path = require('path');
const { Command } = require('commander');

const program = new Command();
program
  .option('-h, --host <type>', 'адреса сервера')
  .option('-p, --port <number>', 'порт сервера')
  .option('-c, --cache <path>', 'шлях до кеш-директорії');

program.parse(process.argv);

const options = program.opts();
const host = options.host;
const port = options.port;
const cache = options.cache;

if (!host || !port || !cache) {
  console.error('Помилка: не задано обов`язкові параметри --host, --port та --cache.');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end(`Сервер працює на ${host}:${port}. Кеш знаходиться в: ${path.resolve(cache)}\n`);
});

server.listen(port, host, () => {
  console.log(`Сервер запущено на ${host}:${port}`);
});

