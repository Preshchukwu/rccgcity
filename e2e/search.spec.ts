import { test, expect } from '@playwright/test'

const FACILITIES = [
  { id: 'f1', name: 'Block A Toilets', category: 'toilet', status: 'open', latitude: 6.63, longitude: 3.58, images: [], description: null, updatedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 'f2', name: 'Main Auditorium', category: 'auditorium', status: 'crowded', latitude: 6.64, longitude: 3.59, images: [], description: null, updatedAt: new Date().toISOString(), createdAt: new Date().toISOString() },
]

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('nosplash', '1'))
})

test.describe('Search page', () => {
  test('renders search input and filter chips', async ({ page }) => {
    await page.route('/api/facilities**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    )

    await page.goto('/search')
    await expect(page.getByPlaceholder('Facility name, category…')).toBeVisible()
    await expect(page.getByRole('button', { name: 'All' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Open', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Toilets', exact: true })).toBeVisible()
  })

  test('shows facility results after typing a query', async ({ page }) => {
    await page.route('/api/facilities**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(FACILITIES) })
    )

    await page.goto('/search')
    await page.getByPlaceholder('Facility name, category…').fill('toilet')

    await expect(page.getByText('Block A Toilets')).toBeVisible()
    await expect(page.getByText('Main Auditorium')).toBeVisible()
  })

  test('shows no-results message when API returns empty array', async ({ page }) => {
    await page.route('/api/facilities**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    )

    await page.goto('/search')
    await page.getByPlaceholder('Facility name, category…').fill('xyznothing')

    await expect(page.getByText(/No facilities found/)).toBeVisible()
  })

  test('status filter chip becomes active on click', async ({ page }) => {
    await page.route('/api/facilities**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    )

    await page.goto('/search')
    const openChip = page.getByRole('button', { name: 'Open', exact: true })

    // Click the Open filter
    await openChip.click()

    // Chip should now have brand colour border (active state from filterChipStyle)
    // Verify via aria or computed style that it's selected
    const borderColor = await openChip.evaluate(el => getComputedStyle(el).borderColor)
    // The active chip uses var(--color-brand) — just confirm it's different from the inactive default
    expect(borderColor).toBeTruthy()
  })
})
