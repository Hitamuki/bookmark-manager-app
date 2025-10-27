/**
 * sample.e2e
 * モジュール定義
 */
import { expect, test } from '@playwright/test';

test('should display samples from API', async ({ page }) => {
  await page.goto('/');

  // Navigate to a page that displays samples, or directly fetch from API if possible
  // For now, let's assume the homepage eventually displays samples or we can navigate to a sample list page.
  // If there's a specific route for samples, use await page.goto('/samples');

  // Make an API call to the backend to get samples
  const response = await page.request.get('http://localhost:4000/api/samples');
  expect(response.ok()).toBeTruthy();

  const samples = await response.json();
  expect(samples.data).toHaveLength(3); // Expect 3 samples from seeding
  expect(samples.data[0].title).toBe('Sample 1');
  expect(samples.data[1].title).toBe('Sample 2');
  expect(samples.data[2].title).toBe('Sample 3');
});
