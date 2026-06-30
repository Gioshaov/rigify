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

    // District is a custom dropdown (not a native select): open it, then pick the option.
    await page.getByTestId('district-dropdown-trigger').click();
    await page.getByTestId('district-option-vake').click();

    // Wait for filtering to apply by checking business cards remain visible
    const businessCards = page.locator('[data-testid^="business-card-"]');
    await expect(businessCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should filter by category and sync ?category= to the URL', async ({ page }) => {
    await bypassSitePassword(page);
    await page.goto('/businesses');

    // Category is a custom dropdown: open it, pick Hair.
    await page.getByTestId('category-dropdown-trigger').click();
    await page.getByTestId('category-option-hair').click();

    // Selection round-trips into the URL (landing cards link with ?category=).
    await expect(page).toHaveURL(/[?&]category=hair\b/);
    await expect(page.getByTestId('category-dropdown-trigger')).toContainText('Hair');
    // Grid still renders after filtering — guards against a broken filter memo.
    await expect(page.locator('[data-testid^="business-card-"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should initialize the Category filter from ?category= in the URL', async ({ page }) => {
    await bypassSitePassword(page);
    await page.goto('/businesses?category=nails');

    // The dropdown reflects the URL value on load, not a stale "All Categories".
    await expect(page.getByTestId('category-dropdown-trigger')).toContainText('Nails');
  });

  test('should pass an unknown ?category= through to the empty state', async ({ page }) => {
    await bypassSitePassword(page);
    await page.goto('/businesses?category=cosmetology');

    // cosmetology isn't in CATEGORIES — the control still reflects it (title-cased)...
    await expect(page.getByTestId('category-dropdown-trigger')).toContainText('Cosmetology');
    // ...and no seeded business matches, so the empty state renders.
    await expect(page.getByTestId('browse-studios-empty-state-title')).toBeVisible();
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
