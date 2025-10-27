/**
 * global-teardown
 * モジュール定義
 */
import { execSync } from 'node:child_process';
import * as path from 'node:path';
import type { FullConfig } from '@playwright/test';

const rootDir = path.join(__dirname, '../../../../../../../');

async function globalTeardown(_config: FullConfig) {
  console.log('Global teardown started...');

  // Stop Docker for E2E tests
  console.log('Stopping Docker for E2E tests...');
  execSync('docker-compose -f infra/docker/docker-compose.e2e.yml down -v', {
    stdio: 'inherit',
    cwd: rootDir, // Adjust path to workspace root
  });
  console.log('Docker for E2E tests stopped.');

  console.log('Global teardown finished.');
}

export default globalTeardown;
