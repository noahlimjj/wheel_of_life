const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:5173/');
  // Clear local storage before each test to ensure a clean state
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test.describe('Data Persistence', () => {
  test('should persist the app state', async ({ page }) => {
    // Add a category
    await page.click('.add-category-card');
    await page.fill('#newCategoryName', 'Test Category');
    await page.fill('#newCategoryColor', '#ff0000');
    await page.click('#addCategoryForm button[type="submit"]');

    // Add a goal
    await page.fill('.category-card:first-child .add-goal-input', 'Test Goal');
    await page.press('.category-card:first-child .add-goal-input', 'Enter');

    // Reload the page
    await page.reload();

    // Verify that the data is still there
    await expect(page.locator('.category-card:first-child .category-name')).toHaveText('Test Category');
    await expect(page.locator('.category-card:first-child .goal-text')).toHaveText('Test Goal');
  });

  test('should clear the data', async ({ page }) => {
    // Add a category
    await page.click('.add-category-card');
    await page.fill('#newCategoryName', 'Test Category');
    await page.click('#addCategoryForm button[type="submit"]');

    // Click the clear data button
    page.on('dialog', dialog => dialog.accept());
    await page.click('#clearDataBtn');

    // Reload the page
    await page.reload();

    // Verify that the data is gone
    await expect(page.locator('.category-card:not(.add-category-card)')).toHaveCount(8);
  });
});

test.describe('Category Management', () => {
  test('should add a new category', async ({ page }) => {
    await page.click('.add-category-card');
    await page.fill('#newCategoryName', 'New Category');
    await page.fill('#newCategoryColor', '#00ff00');
    await page.click('#addCategoryForm button[type="submit"]');

    await expect(page.locator('.category-card:nth-child(9) .category-name')).toHaveText('New Category');
  });

  test('should edit a category', async ({ page }) => {
    await page.click('.category-card:first-child .btn--outline:has-text("✏️")');
    await page.fill('#editCategoryName', 'Edited Category');
    await page.fill('#editCategoryColor', '#0000ff');
    await page.click('#categoryEditForm button[type="submit"]');

    await expect(page.locator('.category-card:first-child .category-name')).toHaveText('Edited Category');
  });

  test('should delete a category', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
    await page.click('.category-card:first-child .btn--outline:has-text("✏️")');
    await page.click('#deleteCategoryBtn');

    await expect(page.locator('.category-card:not(.add-category-card)')).toHaveCount(7);
  });
});

test.describe('Goal Management', () => {
  test('should add a new goal', async ({ page }) => {
    await page.fill('.category-card:first-child .add-goal-input', 'New Goal');
    await page.press('.category-card:first-child .add-goal-input', 'Enter');

    await expect(page.locator('.category-card:first-child .goal-text')).toHaveText('New Goal');
  });

  test('should edit a goal', async ({ page }) => {
    await page.fill('.category-card:first-child .add-goal-input', 'Initial Goal');
    await page.press('.category-card:first-child .add-goal-input', 'Enter');

    await page.click('.category-card:first-child .goal-item .btn--outline:has-text("✏️")');
    await page.fill('.category-card:first-child .goal-item .goal-edit-input', 'Edited Goal');
    await page.click('.category-card:first-child .goal-item .btn--primary:has-text("Save")');

    await expect(page.locator('.category-card:first-child .goal-text')).toHaveText('Edited Goal');
  });

  test('should toggle a goal', async ({ page }) => {
    await page.fill('.category-card:first-child .add-goal-input', 'Toggle Goal');
    await page.press('.category-card:first-child .add-goal-input', 'Enter');

    await page.check('.category-card:first-child .goal-item .goal-checkbox');
    await expect(page.locator('.category-card:first-child .goal-item .goal-text')).toHaveClass(/completed/);

    await page.uncheck('.category-card:first-child .goal-item .goal-checkbox');
    await expect(page.locator('.category-card:first-child .goal-item .goal-text')).not.toHaveClass(/completed/);
  });

  test('should delete a goal', async ({ page }) => {
    await page.fill('.category-card:first-child .add-goal-input', 'Delete Goal');
    await page.press('.category-card:first-child .add-goal-input', 'Enter');

    page.on('dialog', dialog => dialog.accept());
    await page.click('.category-card:first-child .goal-item .btn--outline:has-text("🗑️")');

    await expect(page.locator('.category-card:first-child .goal-item')).toHaveCount(0);
  });
});
