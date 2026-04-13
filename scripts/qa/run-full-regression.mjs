import { execSync } from 'node:child_process';

const orderedSuites = [
  ['Smoke', 'npm.cmd run test:smoke'],
  ['Auth', 'npm.cmd run test:auth'],
  ['Permissions', 'npm.cmd run test:permissions'],
  ['Public', 'npm.cmd run test:public'],
  ['Reader', 'npm.cmd run test:reader'],
  ['Author', 'npm.cmd run test:author'],
  ['Admin', 'npm.cmd run test:admin'],
  ['Books', 'npm.cmd run test:books'],
  ['Engagement', 'npm.cmd run test:engagement'],
  ['Communications', 'npm.cmd run test:communications'],
  ['UI Actions', 'npm.cmd run test:ui-actions'],
  ['Demo Data', 'npm.cmd run test:demo-data']
];

for (const [label, command] of orderedSuites) {
  console.log(`\n=== ${label} ===`);
  console.log(`> ${command}`);
  execSync(command, { stdio: 'inherit' });
}

console.log('\nFull regression suite passed.');
