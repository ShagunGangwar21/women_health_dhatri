import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('\n🌸 ========================================================');
console.log('    DHATRI (धात्री) — Your Wellness Bestie');
console.log('    Starting Full-Stack Platform (Server + Client)...');
console.log('========================================================\n');

// 1. Start Server on port 5000
const serverProc = spawn(process.execPath, [path.join(__dirname, 'server', 'src', 'server.js')], {
  stdio: 'inherit',
  cwd: path.join(__dirname, 'server'),
  env: { ...process.env, PORT: '5000' }
});

// 2. Start Vite Client on port 3000
const viteBin = path.join(__dirname, 'client', 'node_modules', 'vite', 'bin', 'vite.js');
const clientProc = spawn(process.execPath, [viteBin, '--port', '3000', '--host'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, 'client'),
  env: { ...process.env }
});

function cleanup() {
  console.log('\n[Dhatri] Gracefully shutting down services...');
  serverProc.kill();
  clientProc.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
