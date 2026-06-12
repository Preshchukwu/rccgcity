import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('nosplash', '1'))
})

test.describe('Help & Emergency page', () => {
  test('renders security call button, medical centre, and emergency form', async ({ page }) => {
    await page.goto('/help')
    await expect(page.getByRole('heading', { name: 'Help & Emergency' })).toBeVisible()
    await expect(page.getByText('Call Camp Security')).toBeVisible()
    await expect(page.getByText('RCCG Medical Centre')).toBeVisible()
    await expect(page.getByText('Report an Emergency')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Send Emergency Report' })).toBeVisible()
  })

  test('security call link has correct tel: href', async ({ page }) => {
    await page.goto('/help')
    const callLink = page.getByRole('link', { name: /Call Camp Security/i })
    await expect(callLink).toHaveAttribute('href', /^tel:/)
  })

  test('medical directions link points to Google Maps', async ({ page }) => {
    await page.goto('/help')
    const dirLink = page.getByRole('link', { name: 'Get Directions' })
    await expect(dirLink).toHaveAttribute('href', /google\.com\/maps/)
  })

  test('shows success confirmation after emergency report submission', async ({ page }) => {
    await page.route('/api/emergencies', route =>
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'em-1' }) })
    )

    await page.goto('/help')
    await page.getByPlaceholder('Full name').fill('Jane Doe')
    await page.getByPlaceholder('What is happening?').fill('Medical emergency')
    await page.getByPlaceholder('Near which landmark or building?').fill('Main auditorium')
    await page.getByRole('button', { name: 'Send Emergency Report' }).click()

    await expect(page.getByText('Report submitted. Security has been notified.')).toBeVisible()
  })

  test('shows error message when API fails', async ({ page }) => {
    await page.route('/api/emergencies', route =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Server error' }) })
    )

    await page.goto('/help')
    await page.getByPlaceholder('Full name').fill('Jane Doe')
    await page.getByPlaceholder('What is happening?').fill('Fire')
    await page.getByPlaceholder('Near which landmark or building?').fill('Block B')
    await page.getByRole('button', { name: 'Send Emergency Report' }).click()

    await expect(page.getByText('Something went wrong')).toBeVisible()
  })
})
