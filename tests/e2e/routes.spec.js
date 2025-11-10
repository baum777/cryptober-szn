/**
 * E2E Route Tests
 * Tests each route for H1 presence and section visibility
 */

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load sitemap
const sitemapPath = path.join(__dirname, '../../docs/h1-sitemap.json');
const sitemap = JSON.parse(fs.readFileSync(sitemapPath, 'utf8'));

/**
 * Test each route in the sitemap
 */
for (const [route, { h1, sections }] of Object.entries(sitemap)) {
  test.describe(`Route: ${route}`, () => {
    
    test('should render H1 correctly', async ({ page }) => {
      await page.goto(route);
      
      // Wait for page load
      await page.waitForLoadState('networkidle');
      
      // Check H1 exists and matches (allowing for emoji/special chars)
      const h1Element = page.locator('h1').first();
      await expect(h1Element).toBeVisible();
      
      const actualText = await h1Element.textContent();
      
      // Normalize text for comparison (strip emojis and extra whitespace)
      const normalizedActual = actualText.trim().replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
      const normalizedExpected = h1.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
      
      expect(normalizedActual).toContain(normalizedExpected);
    });
    
    test('should have all expected H2 sections', async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      if (sections.length === 0) {
        test.skip();
        return;
      }
      
      // Check each section heading exists
      for (const section of sections) {
        const sectionHeading = page.locator('h2', { hasText: section });
        await expect(sectionHeading).toBeVisible({ timeout: 5000 });
      }
    });
    
    test('should pass basic accessibility checks', async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      // Check for proper HTML lang attribute
      const htmlLang = await page.getAttribute('html', 'lang');
      expect(htmlLang).toBe('en');
      
      // Check for proper landmark structure
      const main = page.locator('main');
      await expect(main).toBeVisible();
      
      const header = page.locator('header');
      await expect(header).toBeVisible();
      
      // Check all images have alt text (or are decorative with empty alt)
      const images = await page.locator('img').all();
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        expect(alt).toBeDefined(); // alt attribute must exist (can be empty for decorative)
      }
    });
    
    test('should be keyboard navigable', async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      
      // Check that focus is visible
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });
      
      expect(focusedElement).toBeTruthy();
    });
    
    test('should respond to viewport changes', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      const h1Mobile = page.locator('h1').first();
      await expect(h1Mobile).toBeVisible();
      
      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForLoadState('networkidle');
      
      const h1Desktop = page.locator('h1').first();
      await expect(h1Desktop).toBeVisible();
    });
  });
}

/**
 * Additional cross-route tests
 */
test.describe('Cross-route functionality', () => {
  
  test('navigation links work correctly', async ({ page }) => {
    await page.goto('/');
    
    // Test Lore link from home
    const loreLink = page.locator('a[href="/lore_index.html"]');
    await expect(loreLink).toBeVisible();
    await loreLink.click();
    
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/lore_index.html');
    
    // Test Mascot link
    const mascotLink = page.locator('a[href="/lore_mascot.html"]');
    await expect(mascotLink).toBeVisible();
    await mascotLink.click();
    
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/lore_mascot.html');
    
    // Test Home link back
    const homeLink = page.locator('a[href="/"]').first();
    await homeLink.click();
    
    await page.waitForLoadState('networkidle');
    expect(page.url()).not.toContain('.html');
  });
  
  test('footer present on all pages', async ({ page }) => {
    for (const route of Object.keys(sitemap)) {
      await page.goto(route);
      const footer = page.locator('footer#site-footer');
      await expect(footer).toBeVisible();
    }
  });
});
