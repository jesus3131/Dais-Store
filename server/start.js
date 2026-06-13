import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log(`Starting server from ${__dirname}`);

const server = spawn('node', ['src/index.js'], {
  cwd: __dirname,
  stdio: 'inherit',
});

process.on('SIGINT', () => {
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  server.kill('SIGTERM');
});

server.on('exit', (code) => {
  process.exit(code);
});
