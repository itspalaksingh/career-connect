const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const services = [
  { name: 'API', cwd: path.join(root, 'backend'), entry: 'server.js' },
  {
    name: 'Web',
    cwd: path.join(root, 'CareerConnect', 'frontend'),
    entry: path.join('node_modules', 'next', 'dist', 'bin', 'next'),
    args: ['dev'],
  },
];

let stopping = false;
const children = [];

function stopAll(signal = 'SIGTERM') {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode === null && !child.killed) child.kill(signal);
  }
}

async function start() {
  const frontendDirectory = path.join(root, 'CareerConnect', 'frontend');
  const nextDist = process.env.NEXT_DIST_DIR || '.next-dev';
  const webAlreadyRunning = fs.existsSync(path.join(frontendDirectory, nextDist, 'dev', 'lock'));
  if (webAlreadyRunning) {
    console.log('Web app already responds on port 3000; starting the API only.');
  }

  for (const service of services) {
    if (webAlreadyRunning && service.name === 'Web') continue;

    const child = spawn(process.execPath, [service.entry, ...(service.args || [])], {
      cwd: service.cwd,
      env: service.name === 'Web'
        ? { ...process.env, NEXT_DIST_DIR: nextDist }
        : process.env,
      stdio: 'inherit',
    });
    children.push(child);

    child.on('error', (error) => {
      console.error(`${service.name} could not start: ${error.message}`);
      process.exitCode = 1;
      stopAll();
    });

    child.on('exit', (code, signal) => {
      if (stopping) return;
      console.error(`${service.name} stopped${signal ? ` (${signal})` : ` with exit code ${code}`}.`);
      process.exitCode = code || 1;
      stopAll();
    });
  }
}

process.once('SIGINT', () => stopAll('SIGINT'));
process.once('SIGTERM', () => stopAll('SIGTERM'));
start().catch((error) => {
  console.error(`Could not start CareerConnect: ${error.message}`);
  process.exitCode = 1;
  stopAll();
});
