import { expect, test } from '@playwright/test'

test('loads the primary experience', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Start Camera & Mic' }),
  ).toBeVisible()
})
