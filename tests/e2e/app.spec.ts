import { expect, test } from '@playwright/test'

test('loads the primary experience', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Start Camera & Mic' }),
  ).toBeVisible()
})

test('shows the measuring view after the intro without overflow', async ({
  page,
}) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Got it' }).click()
  await expect(
    page.getByRole('heading', { level: 2, name: 'Last strike' }),
  ).toBeVisible()
  await expect(page.getByLabel('Thunder sensitivity')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'About & diagnostics' }),
  ).toBeVisible()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})
