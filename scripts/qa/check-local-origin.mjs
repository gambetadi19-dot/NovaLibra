import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const rootDir = process.cwd();
const backendEnvPath = path.join(rootDir, 'backend', '.env');
const backendEnvExamplePath = path.join(rootDir, 'backend', '.env.example');
const frontendDevScriptPath = path.join(rootDir, 'frontend', 'scripts', 'vite-dev.mjs');

function readText(filePath) {
  return existsSync(filePath) ? readFileSync(filePath, 'utf8') : '';
}

function extractClientUrl(text) {
  const match = text.match(/^CLIENT_URL=(.+)$/m);
  return match ? match[1].trim() : '';
}

const backendEnvText = readText(backendEnvPath);
const backendExampleText = readText(backendEnvExamplePath);
const frontendDevScript = readText(frontendDevScriptPath);

const configuredClientUrl = extractClientUrl(backendEnvText) || extractClientUrl(backendExampleText) || 'http://localhost:5173';
const frontendDefaultsToLocalhost = frontendDevScript.includes("process.env.HOST || 'localhost'");

if (configuredClientUrl === 'http://localhost:5173' && !frontendDefaultsToLocalhost) {
  console.error([
    'Origin mismatch detected.',
    `Backend expects CLIENT_URL=${configuredClientUrl}.`,
    'Frontend dev helper does not default to localhost.',
    'This can break login and refresh-token behavior when the browser opens on 127.0.0.1.',
    'Fix the frontend HOST default or run the frontend with HOST=localhost.'
  ].join('\n'));
  process.exit(1);
}

console.log(`Origin sanity check passed for CLIENT_URL=${configuredClientUrl}.`);
