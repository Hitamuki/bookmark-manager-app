/**
 * global-setup
 * モジュール定義
 */
import { exec, execSync } from 'node:child_process';
import * as path from 'node:path';
import type { FullConfig } from '@playwright/test';

const rootDir = path.join(__dirname, '../../../../../../../');
const composeFile = 'infra/docker/docker-compose.e2e.yml';

async function waitForPostgresReady(timeoutMs = 30000, intervalMs = 2000) {
  const start = Date.now();
  console.log('Waiting for PostgreSQL to be ready...');

  while (true) {
    try {
      execSync(`docker compose -f ${composeFile} exec -T postgres_e2e pg_isready -U user -h postgres_e2e -p 5432`, {
        stdio: 'ignore',
        cwd: rootDir,
      });
      console.log('✅ PostgreSQL is ready.');
      break;
    } catch {
      const elapsed = Date.now() - start;
      if (elapsed > timeoutMs) {
        throw new Error(`⏰ Timeout: PostgreSQL did not become ready after ${timeoutMs / 1000}s`);
      }
      await new Promise((res) => setTimeout(res, intervalMs));
    }
  }
}

async function globalSetup(_config: FullConfig) {
  console.log('Global setup started...');

  // Start Docker for E2E tests
  console.log('Starting Docker for E2E tests...');
  execSync('docker-compose -f infra/docker/docker-compose.e2e.yml up -d', {
    stdio: 'inherit',
    cwd: rootDir,
  });
  console.log('Docker for E2E tests started.');

  // Wait for PostgreSQL to be ready
  await waitForPostgresReady();

  // Set DATABASE_URL for E2E tests
  process.env.DATABASE_URL = 'postgres://user:password@localhost:5433/main_e2e';

  // Push Prisma Schema to synchronize with DB
  console.log('Pushing Prisma schema to database...');
  execSync('pnpm prisma db push --schema src/libs/prisma/schema.prisma --force-reset', {
    stdio: 'inherit',
    cwd: rootDir,
  });
  console.log('Prisma schema pushed.');

  // Run Prisma Seeding
  console.log('Running Prisma seeding...');
  execSync('pnpm prisma db seed', {
    stdio: 'inherit',
    cwd: rootDir,
  });
  console.log('Prisma seeding completed.');

  process.env.MONGO_LOG_URI = 'mongodb://user:password@localhost:27018/logs_e2e?authSource=admin';

  // Start NestJS server
  console.log('Starting NestJS server...');
  const nestjsProcess = exec('pnpm nx run api-core:serve:e2e', {
    cwd: rootDir,
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL, MONGO_LOG_URI: process.env.MONGO_LOG_URI }, // Ensure DATABASE_URL and MONGO_LOG_URI are passed
  });

  nestjsProcess.stdout?.on('data', (data: string) => {
    console.log(`NestJS stdout: ${data}`);
  });

  nestjsProcess.stderr?.on('data', (data: string) => {
    console.error(`NestJS stderr: ${data}`);
  });

  // Store the NestJS process PID for teardown
  process.env.NESTJS_PID = nestjsProcess.pid?.toString();

  // Wait for NestJS server to be ready (e.g., by checking a health endpoint or log output)
  console.log('Waiting for NestJS server to be ready...');
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      console.error('NestJS server startup timed out.');
      resolve();
    }, 60000); // 60 seconds timeout

    nestjsProcess.stdout?.on('data', (data: string) => {
      if (data.includes('Nest application successfully started')) {
        clearTimeout(timeout);
        console.log('NestJS server started.');
        resolve();
      }
    });
  });
  console.log('NestJS server is ready.');

  console.log('Global setup finished.');
}

export default globalSetup;
