import process from 'node:process';

const response = await fetch('http://localhost:5173').catch((error) => {
  console.error(`Frontend smoke failed: ${error.message}`);
  process.exit(1);
});

const html = await response.text();

if (!response.ok) {
  console.error(`Frontend smoke returned HTTP ${response.status}.`);
  process.exit(1);
}

if (!html.includes('<title>NovaLibra</title>') || !html.includes('id="root"')) {
  console.error('Frontend homepage did not return the expected app shell.');
  process.exit(1);
}

console.log('Frontend smoke passed.');
