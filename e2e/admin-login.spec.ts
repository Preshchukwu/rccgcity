import { test, expect } from '@playwright/test'

test.describe('Admin login page', () => {
  test('renders the login form', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.getByText('RCCGCity')).toBeVisible()
    await expect(page.getByText('Admin Dashboard')).toBeVisible()
    await expect(page.getByPlaceholder('admin@rccg.org')).toBeVisible()
    await expect(page.getByPlaceholder('••••••••')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })

  test('shows error message on invalid credentials', async ({ page }) => {
    await page.route(/\/auth\/v1\/token/, route =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'invalid_grant', error_description: 'Invalid login credentials' }),
      })
    )

    await page.goto('/admin/login')
    await page.getByPlaceholder('admin@rccg.org').fill('wrong@example.com')
    await page.getByPlaceholder('••••••••').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText('Invalid email or password.')).toBeVisible()
  })

  test('submit button is disabled while signing in', async ({ page }) => {
    await page.route(/\/auth\/v1\/token/, () => new Promise(() => {}))

    await page.goto('/admin/login')
    await page.getByPlaceholder('admin@rccg.org').fill('admin@example.com')
    await page.getByPlaceholder('••••••••').fill('password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByRole('button', { name: /Signing in/ })).toBeDisabled()
  })
})
