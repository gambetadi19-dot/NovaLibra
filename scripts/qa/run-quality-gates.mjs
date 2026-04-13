import { execSync } from 'node:child_process';

const commands = [
  ['Critical coverage', 'npm.cmd run test:coverage:critical'],
  ['Ordered regression', 'npm.cmd run test:regression']
];

for (const [label, command] of commands) {
  console.log(`\n=== ${label} ===`);
  console.log(`> ${command}`);
  execSync(command, { stdio: 'inherit' });
}

console.log('\nQuality gates passed.');
