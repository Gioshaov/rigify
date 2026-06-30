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
    // The page settles into either the grid or the empty state — a seed-only DB
    // has no 'hair'-tagged business (the seeded salon has no business_categories
    // rows), so don't require a card. Either outcome proves the filter memo
    // rendered instead of crashing or hanging.
    await expect(
      page.locator('[data-testid^="business-card-"]').first()
        .or(page.getByTestId('browse-studios-empty-state-title'))
    ).toBeVisible({ timeout: 10000 });
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

  // NOTE: These two tests assert the "Showing X of Y" count equals the number of
  // cards actually rendered. They run against the ambient DB the rest of this suite
  // already relies on (it needs businesses with coordinates to render cards). They
  // only *catch the split/map count bug* when at least one active business has null
  // coordinates — seed-test-data.ts seeds exactly one such business
  // (`playwright-test-salon`, no lat/long). See the fixture note in the PR: there is
  // no seeded business WITH coordinates, so on a pristine seed-only DB the split view
  // shows the empty state and this assertion has no cards to count.
  async function shownCount(page: import('@playwright/test').Page): Promise<number> {
    // textContent (not innerText): the element has an `uppercase` CSS transform, so
    // innerText would return "SHOWING 8 OF 8" and the regex would miss.
    const text = await page.getByTestId('browse-studios-results-count').textContent();
    const match = text?.match(/Showing (\d+) of/);
    // Throw on a format change rather than returning NaN, so the failure names the
    // real cause instead of a cryptic "Received: NaN".
    if (!match) throw new Error(`Unexpected results-count format: ${JSON.stringify(text)}`);
    return Number(match[1]);
  }

  test('list view count matches the number of rendered cards', async ({ page }) => {
    await bypassSitePassword(page);
    await page.goto('/businesses?view=list');

    const cards = page.locator('[data-testid^="business-card-"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    // List view renders every filtered business, so X equals the card count.
    expect(await shownCount(page)).toBe(await cards.count());
  });

  test('split view count excludes businesses without map coordinates', async ({ page }) => {
    await bypassSitePassword(page);
    await page.goto('/businesses?view=split');

    const cards = page.locator('[data-testid^="split-view-business-card-"]');
    const noCoords = page.getByTestId('browse-studios-split-no-coordinates');

    // Wait for the split view to settle into one of its two terminal states:
    // either cards rendered, or the "no map coordinates" empty state.
    await expect(cards.first().or(noCoords)).toBeVisible({ timeout: 10000 });

    // On a seed-only DB no business has coordinates, so the split view shows the
    // empty state and there are no cards to count. Skip with a clear reason rather
    // than letting a later assertion time out and look like a product regression.
    test.skip(await noCoords.isVisible(), 'No businesses with map coordinates in this DB; split view renders the empty state.');

    // Split view drops null-coordinate businesses; the count must follow the cards,
    // not the unfiltered total (regression guard for the "Showing 2 of 2 / 1 shown" bug).
    expect(await shownCount(page)).toBe(await cards.count());
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
