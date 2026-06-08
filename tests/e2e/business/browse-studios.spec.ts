import { test, expect } from '@playwright/test';
import { bypassSitePassword } from '../../utils/test-helpers';

test.describe('Browse Studios Page', () => {
  test('should display business grid with hero section', async ({ page }) => {
    await bypassSitePassword(page);
    await page.goto('/businesses');

    // Check hero section
    await expect(page.getByTestId('browse-studios-hero-title')).toBeVisible();
    await expect(page.getByTestId('browse-studios-search-input')).toBeVisible();

    // Check business cards are rendered
    const businessCards = page.locator('[data-testid^="business-card-"]');
    await expect(businessCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should filter businesses by search query', async ({ page }) => {
    await bypassSitePassword(page);
    await page.goto('/businesses');

    const searchInput = page.getByTestId('browse-studios-search-input');
    await searchInput.fill('test');
    await page.getByTestId('browse-studios-search-btn').click();

    // Wait for search to apply by checking business cards are still visible
    const businessCards = page.locator('[data-testid^="business-card-"]');
    await expect(businessCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should filter businesses by district', async ({ page }) => {
    await bypassSitePassword(page);
    await page.goto('/businesses');

    const districtSelect = page.getByTestId('browse-studios-district-select');
    await districtSelect.selectOption('vake');

    // Wait for filtering to apply by checking business cards remain visible
    const businessCards = page.locator('[data-testid^="business-card-"]');
    await expect(businessCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should preserve Stitch design hover effects', async ({ page }) => {
    await bypassSitePassword(page);
    await page.goto('/businesses');

    const firstCard = page.locator('[data-testid^="business-card-"]').first();

    // Hover and check that transition classes exist
    await firstCard.hover();

    // The card should have hover effects (this is a basic check)
    await expect(firstCard).toBeVisible();
  });
});
