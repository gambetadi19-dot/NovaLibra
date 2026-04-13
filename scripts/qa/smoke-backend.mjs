import process from 'node:process';

const response = await fetch('http://localhost:5000/api/health').catch((error) => {
  console.error(`Backend health check failed: ${error.message}`);
  process.exit(1);
});

if (!response.ok) {
  console.error(`Backend health check returned HTTP ${response.status}.`);
  process.exit(1);
}

const payload = await response.json();

if (!payload?.success) {
  console.error('Backend health response did not include success=true.');
  process.exit(1);
}

console.log('Backend smoke passed.');
