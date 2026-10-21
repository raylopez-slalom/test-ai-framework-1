import { test, expect } from '@playwright/test'

test('app renders the Travel AI Advisor heading', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /travel ai advisor/i })).toBeVisible()
})
