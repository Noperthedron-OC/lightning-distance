import { expect, test } from '@playwright/test'

test('loads the primary experience and diagnostics', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Primary action' }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'About & diagnostics' }).click()
  await expect(
    page.getByRole('heading', { name: 'About & diagnostics' }),
  ).toBeVisible()
  await expect(page.getByText('Version', { exact: true })).toBeVisible()
})
