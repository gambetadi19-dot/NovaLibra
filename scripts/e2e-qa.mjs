import { spawn } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const rootDir = process.cwd();
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');
const browserProfileDir = path.join(rootDir, '.edge-qa');

const backendUrl = 'http://localhost:5000';
const frontendUrl = 'http://localhost:5173';
const cdpUrl = 'http://127.0.0.1:9222';

const managedProcesses = [];

function log(message) {
  process.stdout.write(`${message}\n`);
}

function spawnManaged(command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
    ...options
  });

  let stdout = '';
  let stderr = '';

  child.stdout?.on('data', (chunk) => {
    stdout += chunk.toString();
  });

  child.stderr?.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  managedProcesses.push(child);

  return { child, getStdout: () => stdout, getStderr: () => stderr };
}

async function runOneShot(command, args, options = {}) {
  const { child, getStdout, getStderr } = spawnManaged(command, args, options);

  return await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code) => {
      if (code === 0) {
        resolve({ stdout: getStdout(), stderr: getStderr() });
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}\n${getStderr() || getStdout()}`));
    });
  });
}

async function wait(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHttp(url, timeoutMs = 20000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }
    } catch {}

    await wait(250);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

function killProcessTree(pid) {
  if (!pid) {
    return;
  }

  const killer = spawn('taskkill', ['/PID', String(pid), '/T', '/F'], {
    stdio: 'ignore',
    windowsHide: true
  });

  return new Promise((resolve) => killer.once('exit', () => resolve()));
}

async function cleanup() {
  const unique = [...new Set(managedProcesses.map((entry) => entry.pid).filter(Boolean))];

  for (const pid of unique.reverse()) {
    await killProcessTree(pid);
  }
}

function findBrowserExecutable() {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  ];

  const executable = candidates.find((candidate) => existsSync(candidate));

  if (!executable) {
    throw new Error('No supported browser executable found. Expected Edge or Chrome on this machine.');
  }

  return executable;
}

async function connectToPageTarget() {
  const targets = await fetch(`${cdpUrl}/json/list`).then((response) => response.json());
  const pageTarget =
    targets.find((entry) => entry.type === 'page' && entry.url === 'about:blank') ||
    targets.find((entry) => entry.type === 'page' && entry.url.startsWith(frontendUrl)) ||
    targets.find((entry) => entry.type === 'page');

  if (!pageTarget?.webSocketDebuggerUrl) {
    throw new Error('Unable to find a debuggable browser page target.');
  }

  return await createCdpSession(pageTarget.webSocketDebuggerUrl);
}

async function createCdpSession(webSocketDebuggerUrl) {
  const socket = new WebSocket(webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  let sequence = 0;
  const pending = new Map();

  socket.addEventListener('message', (event) => {
    const payload = JSON.parse(event.data.toString());

    if (!payload.id || !pending.has(payload.id)) {
      return;
    }

    const pair = pending.get(payload.id);
    pending.delete(payload.id);

    if (payload.error) {
      pair.reject(new Error(payload.error.message));
      return;
    }

    pair.resolve(payload.result);
  });

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++sequence;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const result = await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    });

    return result.result?.value;
  }

  async function waitFor(expression, timeoutMs = 15000, intervalMs = 100) {
    const start = Date.now();

    while (Date.now() - start < timeoutMs) {
      const value = await evaluate(expression);
      if (value) {
        return value;
      }

      await wait(intervalMs);
    }

    throw new Error(`Timed out waiting for: ${expression}`);
  }

  async function navigate(pathname) {
    await send('Page.navigate', { url: `${frontendUrl}${pathname}` });
    await waitFor(`location.href.startsWith(${JSON.stringify(frontendUrl)})`);
    await waitFor(`document.readyState === 'complete'`);
    await wait(800);
  }

  async function setInput(selector, value, tag = 'input') {
    const success = await evaluate(`(() => {
      const field = document.querySelector(${JSON.stringify(selector)});
      if (!field) return false;
      const prototype = ${JSON.stringify(tag)} === 'textarea' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
      descriptor.set.call(field, ${JSON.stringify(value)});
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`);

    if (!success) {
      throw new Error(`Missing selector ${selector}`);
    }
  }

  async function click(selector) {
    const success = await evaluate(`(() => {
      const node = document.querySelector(${JSON.stringify(selector)});
      if (!node) return false;
      node.click();
      return true;
    })()`);

    if (!success) {
      throw new Error(`Missing selector ${selector}`);
    }
  }

  async function bodyText() {
    return await evaluate('document.body.innerText');
  }

  async function clearSession() {
    await evaluate('localStorage.clear(); sessionStorage.clear();');
  }

  async function login(email, password) {
    await clearSession();
    await navigate('/login');
    await setInput('#email', email);
    await setInput('#password', password);
    await click('button[type="submit"]');
    await waitFor(`localStorage.getItem('novalibra_user') !== null`, 20000);
    await wait(1200);
  }

  await send('Page.enable');
  await send('Runtime.enable');

  return {
    send,
    evaluate,
    waitFor,
    navigate,
    setInput,
    click,
    bodyText,
    clearSession,
    login,
    close() {
      socket.close();
    }
  };
}

async function runChecks(page) {
  const results = [];

  async function check(name, fn) {
    try {
      const details = await fn();
      results.push({ name, status: 'PASS', details });
      log(`PASS ${name}`);
    } catch (error) {
      results.push({ name, status: 'FAIL', details: error.message });
      log(`FAIL ${name}: ${error.message}`);
    }
  }

  await check('Reader login and profile render', async () => {
    await page.login('user@example.com', 'password123');
    await page.navigate('/profile');
    const text = await page.bodyText();
    if (!text.includes('Nomsa Reader') || !text.includes('Shape your literary presence.')) {
      throw new Error('Reader profile content missing');
    }
    return 'Reader profile rendered after login';
  });

  await check('Reader books and detail render', async () => {
    await page.navigate('/books');
    await page.waitFor(`document.body.innerText.includes('Browse a catalog designed to feel guided, not crowded.')`);
    await page.navigate('/books/worlds-apart');
    await page.waitFor(`document.body.innerText.includes('Threaded community conversation')`);
    return 'Reader can browse catalog and open book detail';
  });

  await check('Reader can use messaging UI', async () => {
    await page.navigate('/messages');
    await page.waitFor(`document.body.innerText.includes('Reach authors and keep the conversation personal.')`);
    await page.setInput('#subject', 'Browser QA reader message');
    await page.setInput('#message', 'This browser QA message verifies the reader inbox compose experience through the rendered UI.', 'textarea');
    await page.click('button[type="submit"]');
    await page.waitFor(`document.body.innerText.includes('Browser QA reader message')`, 20000);
    return 'Reader compose/inbox flow works';
  });

  await check('Reader notifications render', async () => {
    await page.navigate('/notifications');
    await page.waitFor(`document.body.innerText.includes('Realtime reader updates, kept calm and readable.')`);
    const text = await page.bodyText();
    if (!text.includes('Mark all as read')) {
      throw new Error('Notifications actions missing');
    }
    return 'Reader notifications page works';
  });

  await check('Author login and my-books render', async () => {
    await page.login('author@example.com', 'password123');
    await page.navigate('/my-books');
    await page.waitFor(`document.body.innerText.includes('Your published catalog')`);
    const text = await page.bodyText();
    if (!text.includes('Worlds Apart')) {
      throw new Error('Author titles missing');
    }
    return 'Author workspace works';
  });

  await check('Author analytics render', async () => {
    await page.navigate('/author-analytics');
    await page.waitFor(`document.body.innerText.includes('AUTHOR ANALYTICS')`);
    const text = await page.bodyText();
    if (!text.includes('TOP PERFORMING BOOKS') || !text.includes('FOLLOWERS')) {
      throw new Error('Analytics content missing');
    }
    return 'Author analytics works';
  });

  await check('Admin login and dashboard render', async () => {
    await page.login('admin@example.com', 'password123');
    await page.navigate('/admin');
    await page.waitFor(`document.body.innerText.includes('ADMIN DASHBOARD')`);
    const text = await page.bodyText();
    if (!text.includes('TOP BOOKS') || !text.includes('RECENT USERS')) {
      throw new Error('Dashboard content missing');
    }
    return 'Admin dashboard works';
  });

  await check('Admin user and comment moderation render', async () => {
    await page.navigate('/admin/users');
    await page.waitFor(`document.body.innerText.includes('MEMBER DIRECTORY')`);
    let text = await page.bodyText();
    if (!text.includes('Amina Dube')) {
      throw new Error('Admin users list missing author');
    }
    await page.navigate('/admin/comments');
    await page.waitFor(`document.body.innerText.includes('MODERATION')`);
    text = await page.bodyText();
    if (!text.includes('Reply')) {
      throw new Error('Reply action missing');
    }
    return 'Admin moderation pages work';
  });

  await check('Admin inbox renders and unread statuses clear', async () => {
    await page.navigate('/admin/messages');
    await page.waitFor(`document.body.innerText.includes('INBOX MANAGEMENT')`);
    await wait(2500);
    const statuses = await page.evaluate(`(() => [...document.querySelectorAll('article span')]
      .map((el) => el.textContent.trim())
      .filter((text) => text === 'READ' || text === 'UNREAD'))()`);

    if (!statuses?.length) {
      throw new Error('No message statuses visible');
    }

    if (statuses.includes('UNREAD')) {
      throw new Error('Unread statuses still visible after render');
    }

    return `Admin inbox rendered with statuses: ${statuses.join(', ')}`;
  });

  return results;
}

async function main() {
  log('Seeding database to a known baseline...');
  await runOneShot(process.execPath, ['prisma/seed.js'], { cwd: backendDir, env: process.env });

  if (existsSync(browserProfileDir)) {
    rmSync(browserProfileDir, { recursive: true, force: true });
  }

  log('Starting backend server...');
  const backend = spawnManaged(process.execPath, ['src/server.js'], {
    cwd: backendDir,
    env: {
      ...process.env,
      CLIENT_URL: frontendUrl
    }
  });

  await waitForHttp(`${backendUrl}/api/health`);

  log('Starting frontend dev server...');
  const frontend = spawnManaged(process.execPath, ['scripts/vite-dev.mjs'], {
    cwd: frontendDir,
    env: {
      ...process.env,
      HOST: 'localhost',
      PORT: '5173'
    }
  });

  await waitForHttp(frontendUrl);

  log('Launching headless browser...');
  const browserExecutable = findBrowserExecutable();
  const browser = spawnManaged(
    browserExecutable,
    [
      '--headless=new',
      '--disable-gpu',
      '--remote-debugging-port=9222',
      `--user-data-dir=${browserProfileDir}`,
      'about:blank'
    ],
    {
      cwd: rootDir
    }
  );

  await waitForHttp(`${cdpUrl}/json/version`);

  log('Running end-to-end browser QA...');
  const page = await connectToPageTarget();
  const results = await runChecks(page);
  page.close();

  const failures = results.filter((result) => result.status === 'FAIL');
  log('');
  log('QA Summary');
  log(JSON.stringify(results, null, 2));

  if (failures.length) {
    throw new Error(`${failures.length} end-to-end QA checks failed.`);
  }

  log('');
  log('All end-to-end QA checks passed.');
  void backend;
  void frontend;
  void browser;
}

try {
  await main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await cleanup();
}
