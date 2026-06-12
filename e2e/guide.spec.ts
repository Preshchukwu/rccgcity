import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('nosplash', '1'))
})

test.describe('Guide request page', () => {
  test('renders all form fields', async ({ page }) => {
    await page.goto('/guide')
    await expect(page.getByRole('heading', { name: 'Request a Guide' })).toBeVisible()
    await expect(page.getByPlaceholder('Your full name')).toBeVisible()
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible()
    await expect(page.getByPlaceholder('+234 800 000 0000')).toBeVisible()
    await expect(page.getByPlaceholder('e.g. Nigerian')).toBeVisible()
    await expect(page.getByRole('combobox')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Request a Guide' })).toBeVisible()
  })

  test('language dropdown contains all supported languages', async ({ page }) => {
    await page.goto('/guide')
    const options = page.getByRole('combobox').locator('option')
    await expect(options).toHaveCount(5)
    for (const lang of ['English', 'Yoruba', 'Igbo', 'Hausa', 'French']) {
      await expect(page.getByRole('option', { name: lang })).toBeAttached()
    }
  })

  test('shows success state after submission', async ({ page }) => {
    await page.route('/api/guide-requests', route =>
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'gr-1' }) })
    )

    await page.goto('/guide')
    await page.getByPlaceholder('Your full name').fill('John Doe')
    await page.getByPlaceholder('you@example.com').fill('john@example.com')
    await page.getByPlaceholder('+234 800 000 0000').fill('+2348001234567')
    await page.getByPlaceholder('e.g. Nigerian').fill('Nigerian')
    await page.locator('input[type="date"]').fill('2026-08-01')
    await page.getByRole('button', { name: 'Request a Guide' }).click()

    await expect(page.getByRole('heading', { name: 'Request Submitted' })).toBeVisible()
    await expect(page.getByText('Our team will contact you')).toBeVisible()
  })

  test('shows error message when API fails', async ({ page }) => {
    await page.route('/api/guide-requests', route =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Server error' }) })
    )

    await page.goto('/guide')
    await page.getByPlaceholder('Your full name').fill('John Doe')
    await page.getByPlaceholder('you@example.com').fill('john@example.com')
    await page.getByPlaceholder('+234 800 000 0000').fill('+2348001234567')
    await page.getByPlaceholder('e.g. Nigerian').fill('Nigerian')
    await page.locator('input[type="date"]').fill('2026-08-01')
    await page.getByRole('button', { name: 'Request a Guide' }).click()

    await expect(page.getByText('Something went wrong')).toBeVisible()
  })
})
