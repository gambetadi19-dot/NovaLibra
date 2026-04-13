import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  outputDir: './artifacts/playwright/test-results',
  expect: {
    timeout: 10_000
  },
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: './artifacts/playwright/html-report' }],
    ['junit', { outputFile: './artifacts/playwright/junit/results.xml' }],
    ['json', { outputFile: './artifacts/playwright/json/results.json' }]
  ],
  reportSlowTests: {
    max: 10,
    threshold: 15_000
  },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: [
    {
      command: 'npm.cmd run dev',
      cwd: './backend',
      url: 'http://localhost:5000/api/health',
      reuseExistingServer: true,
      timeout: 60_000
    },
    {
      command: 'cmd /c set HOST=localhost&& set PORT=5173&& npm.cmd run dev',
      cwd: './frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 60_000
    }
  ]
});
