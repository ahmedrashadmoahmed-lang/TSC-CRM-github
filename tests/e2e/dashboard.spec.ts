import { expect, test } from '@playwright/test';
import { TransformStream } from 'stream/web';
global.TransformStream = TransformStream;

test.describe('Dashboard Page', () => {
  test('should load dashboard and show metrics', async ({ page }) => {
    // Navigate to login
    await page.goto('/');

    // Login
    await page.fill('input[name="email"]', 'admin@erp.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForURL('/dashboard-new');

    // Check if metrics are visible
    await expect(page.locator('text=إجمالي قيمة المبيعات')).toBeVisible();
    await expect(page.locator('text=إجمالي الصفقات')).toBeVisible();
  });
});

test.describe('Pipeline Page', () => {
  test('should display Kanban board', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.fill('input[name="email"]', 'admin@erp.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to pipeline
    await page.goto('/pipeline');

    // Check if Kanban columns are visible
    await expect(page.locator('text=عملاء محتملون')).toBeVisible();
    await expect(page.locator('text=عروض مرسلة')).toBeVisible();
    await expect(page.locator('text=مفاوضات')).toBeVisible();
  });
});
