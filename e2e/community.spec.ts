import { test, expect } from '@playwright/test'

const REPORTS = [
  { id: 'r1', facilityId: 'f1', type: 'comment', description: 'Great cleanliness today', category: null, severity: null, createdAt: new Date().toISOString(), facility: { name: 'Block A Toilets' } },
  { id: 'r2', facilityId: 'f2', type: 'issue', description: 'Door handle broken', category: 'damage', severity: 'medium', createdAt: new Date().toISOString(), facility: { name: 'Main Auditorium' } },
]

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('nosplash', '1'))
})

test.describe('Community page', () => {
  test('renders heading and filter chips', async ({ page }) => {
    await page.route('/api/reports**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    )

    await page.goto('/community')
    await expect(page.getByRole('heading', { name: 'Community' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Comments' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Issues' })).toBeVisible()
  })

  test('shows report cards with facility name and description', async ({ page }) => {
    await page.route('/api/reports**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(REPORTS) })
    )

    await page.goto('/community')
    await expect(page.getByText('Great cleanliness today')).toBeVisible()
    await expect(page.getByText('Block A Toilets')).toBeVisible()
    await expect(page.getByText('Door handle broken')).toBeVisible()
    await expect(page.getByText('Main Auditorium')).toBeVisible()
  })

  test('shows empty state when no reports', async ({ page }) => {
    await page.route('/api/reports**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    )

    await page.goto('/community')
    await expect(page.getByText('No reports yet.')).toBeVisible()
  })

  test('filter chip sends type param in request', async ({ page }) => {
    const requests: string[] = []
    await page.route('/api/reports**', route => {
      requests.push(route.request().url())
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })

    await page.goto('/community')
    await page.getByRole('button', { name: 'Comments' }).click()

    await page.waitForTimeout(200)
    expect(requests.some(url => url.includes('type=comment'))).toBe(true)
  })
})
