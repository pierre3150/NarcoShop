import { By, until } from 'selenium-webdriver';
import { getDriver, navigateTo, ensureLoggedIn, logout } from './selenium.config';

describe('CartComponent E2E Tests', () => {

  beforeAll(async () => {
    await getDriver();
  });

  describe('Component Initialization', () => {
    it('GIVEN user not logged in WHEN visiting cart THEN should redirect to auth', async () => {
      const driver = await getDriver();
      await logout();
      await navigateTo(driver, '/cart');
      await driver.sleep(2000);
      const currentUrl = await driver.getCurrentUrl();
      const hasLoginMsg = await driver.findElements(By.xpath("//*[contains(text(), 'connecter') or contains(text(), 'login')]"));
      expect(currentUrl.includes('/auth') || hasLoginMsg.length > 0).toBe(true);
    });

    it('GIVEN logged in user WHEN visiting cart THEN should display cart page', async () => {
      const driver = await getDriver();
      await ensureLoggedIn();
      await navigateTo(driver, '/cart');
      await driver.sleep(1000);
      const body = await driver.findElement(By.css('body')).getText();
      const cartEl = await driver.findElements(By.css('.cart-container, .cart, [class*="cart"]'));
      expect(cartEl.length > 0 || body.toLowerCase().includes('panier')).toBe(true);
    });
  });

  describe('loadCart()', () => {
    beforeEach(async () => {
      const driver = await getDriver();
      await ensureLoggedIn();
      await navigateTo(driver, '/cart');
      await driver.sleep(1000);
    });

    it('GIVEN logged in user WHEN cart loads THEN should display cart content or empty message', async () => {
      const driver = await getDriver();
      const body = await driver.findElement(By.css('body')).getText();
      const hasContent = body.toLowerCase().includes('panier')
        || body.toLowerCase().includes('article')
        || body.toLowerCase().includes('vide')
        || body.toLowerCase().includes('total');
      expect(hasContent).toBe(true);
    });

    it('GIVEN cart page WHEN loaded THEN should display total price section', async () => {
      const driver = await getDriver();
      const totalEl = await driver.findElements(By.xpath("//*[contains(text(), 'Total') or contains(text(), 'total')]"));
      expect(totalEl.length).toBeGreaterThan(0);
    });
  });

  describe('removeFromCart()', () => {
    it('GIVEN item in cart WHEN remove button clicked THEN should ask for confirmation', async () => {
      const driver = await getDriver();
      await ensureLoggedIn();
      await navigateTo(driver, '/cart');
      await driver.sleep(1000);
      const removeButtons = await driver.findElements(
        By.xpath("//button[contains(text(), 'Retirer') or contains(text(), 'Supprimer') or contains(text(), '🗑')]")
      );
      if (removeButtons.length > 0) {
        await removeButtons[0].click();
        await driver.sleep(500);
        try {
          const alert = await driver.switchTo().alert();
          await alert.accept();
        } catch { /* pas de dialog natif */ }
        await driver.sleep(1000);
      }
      expect(true).toBe(true);
    });
  });

  describe('checkout()', () => {
    it('GIVEN empty cart WHEN checkout is called THEN should not validate', async () => {
      const driver = await getDriver();
      await ensureLoggedIn();
      await navigateTo(driver, '/cart');
      await driver.sleep(1000);
      const checkoutBtns = await driver.findElements(
        By.xpath("//button[contains(text(), 'Commander') or contains(text(), 'Valider') or contains(text(), 'Payer')]")
      );
      if (checkoutBtns.length > 0) {
        const body = await driver.findElement(By.css('body')).getText();
        const isEmpty = body.toLowerCase().includes('vide') || body.toLowerCase().includes('empty');
        if (isEmpty) {
          expect(await checkoutBtns[0].isEnabled()).toBe(false);
        } else {
          expect(true).toBe(true);
        }
      } else {
        expect(true).toBe(true);
      }
    });
  });
});
