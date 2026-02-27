import { By, until } from 'selenium-webdriver';
import { getDriver, navigateTo, ensureLoggedIn } from './selenium.config';

describe('HomeComponent E2E Tests', () => {

  beforeAll(async () => {
    await ensureLoggedIn(); // Connexion unique partagée
  });

  describe('Component Initialization', () => {
    it('GIVEN component is created WHEN initialized THEN should create successfully', async () => {
      const driver = await getDriver();
      await navigateTo(driver, '/home');
      const body = await driver.wait(until.elementLocated(By.css('body')), 5000);
      expect(await body.isDisplayed()).toBe(true);
    });

    it('GIVEN component initialization WHEN ngOnInit is called THEN should initialize without errors', async () => {
      const driver = await getDriver();
      await navigateTo(driver, '/home');
      await driver.sleep(1000);
      expect(await driver.getCurrentUrl()).toContain('/home');
    });
  });

  describe('Template Rendering', () => {
    beforeEach(async () => {
      const driver = await getDriver();
      await navigateTo(driver, '/home');
      await driver.sleep(1000);
    });

    it('GIVEN component is initialized WHEN rendered THEN should display main content (.hero)', async () => {
      const driver = await getDriver();
      const hero = await driver.wait(until.elementLocated(By.css('.hero, .hero-section, .hero-content')), 5000);
      expect(await hero.isDisplayed()).toBe(true);
    });

    it('GIVEN home page WHEN rendered THEN should display features section', async () => {
      const driver = await getDriver();
      const features = await driver.wait(until.elementLocated(By.css('.features, .features-section, .feature-card')), 5000);
      expect(await features.isDisplayed()).toBe(true);
    });

    it('GIVEN home page WHEN user clicks on "Voir nos produits" THEN should navigate to articles', async () => {
      const driver = await getDriver();
      const btn = await driver.wait(until.elementLocated(By.xpath(
        "//button[contains(text(), 'produits') or contains(text(), 'Produits')] | //a[contains(text(), 'produits') or contains(text(), 'Produits')]"
      )), 5000);
      await btn.click();
      await driver.sleep(1000);
      expect(await driver.getCurrentUrl()).toContain('/articles');
    });
  });
});
