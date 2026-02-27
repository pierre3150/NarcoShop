import { By, until } from 'selenium-webdriver';
import { getDriver, quitDriver, navigateTo, ensureLoggedIn, logout } from './selenium.config';

describe('AuthComponent E2E Tests', () => {

  beforeAll(async () => {
    await getDriver(); // Ouvre Chrome une seule fois
  });

  afterAll(async () => {
    await quitDriver();
  });

  // ─── Initialisation ───────────────────────────────────────────

  describe('Component Initialization', () => {
    it('GIVEN component is created WHEN initialized THEN should create successfully', async () => {
      const driver = await getDriver();
      await logout();
      await navigateTo(driver, '/auth');
      const form = await driver.wait(until.elementLocated(By.css('form')), 5000);
      expect(await form.isDisplayed()).toBe(true);
    });

    it('GIVEN component initialization WHEN ngOnInit is called THEN should set isRegisterMode to false by default', async () => {
      const driver = await getDriver();
      await navigateTo(driver, '/auth');
      await driver.wait(until.elementLocated(By.css('form')), 5000);
      const adresseFields = await driver.findElements(By.css('input[name="adresse"]'));
      expect(adresseFields.length).toBe(0);
    });
  });

  // ─── toggleMode ───────────────────────────────────────────────

  describe('toggleMode()', () => {
    beforeEach(async () => {
      const driver = await getDriver();
      await navigateTo(driver, '/auth');
      await driver.wait(until.elementLocated(By.css('form')), 5000);
    });

    it('GIVEN login mode WHEN toggleMode is called THEN should switch to register mode', async () => {
      const driver = await getDriver();
      const toggleBtn = await driver.findElement(
        By.xpath("//button[contains(text(), 'inscription') or contains(text(), 'Inscription') or contains(text(), \"S'inscrire\")]")
      );
      await toggleBtn.click();
      await driver.sleep(500);
      const adresseField = await driver.wait(until.elementLocated(By.css('input[name="adresse"]')), 3000);
      expect(await adresseField.isDisplayed()).toBe(true);
    });

    it('GIVEN register mode WHEN toggleMode is called THEN should switch back to login mode', async () => {
      const driver = await getDriver();
      const toggleBtn = await driver.findElement(
        By.xpath("//button[contains(text(), 'inscription') or contains(text(), 'Inscription') or contains(text(), \"S'inscrire\")]")
      );
      await toggleBtn.click();
      await driver.sleep(500);
      const toggleBackBtn = await driver.findElement(
        By.xpath("//button[contains(text(), 'connexion') or contains(text(), 'Connexion') or contains(text(), 'Se connecter')]")
      );
      await toggleBackBtn.click();
      await driver.sleep(500);
      const adresseFields = await driver.findElements(By.css('input[name="adresse"]'));
      expect(adresseFields.length).toBe(0);
    });
  });

  // ─── onLogin ──────────────────────────────────────────────────

  describe('onLogin()', () => {
    beforeEach(async () => {
      const driver = await getDriver();
      await logout();
      await navigateTo(driver, '/auth');
      await driver.wait(until.elementLocated(By.css('form')), 5000);
    });

    it('GIVEN valid credentials WHEN onLogin is called THEN should login and navigate to home', async () => {
      const driver = await getDriver();
      await driver.findElement(By.css('input[name="username"]')).sendKeys('admin');
      await driver.findElement(By.css('input[name="password"]')).sendKeys('admin');
      await driver.findElement(By.css('button[type="submit"]')).click();
      await driver.sleep(2000);
      expect(await driver.getCurrentUrl()).toContain('/home');
    });

    it('GIVEN invalid credentials WHEN onLogin is called THEN should show error message', async () => {
      const driver = await getDriver();
      await driver.findElement(By.css('input[name="username"]')).sendKeys('mauvaisuser');
      await driver.findElement(By.css('input[name="password"]')).sendKeys('mauvaispass');
      await driver.findElement(By.css('button[type="submit"]')).click();
      await driver.sleep(1500);
      const errorMsg = await driver.wait(until.elementLocated(By.css('.error-message, .message.error, [class*="error"]')), 3000);
      expect(await errorMsg.isDisplayed()).toBe(true);
    });

    it('GIVEN empty fields WHEN onLogin is called THEN should show validation error', async () => {
      const driver = await getDriver();
      await driver.findElement(By.css('button[type="submit"]')).click();
      await driver.sleep(500);
      expect(await driver.getCurrentUrl()).toContain('/auth');
    });
  });

  // ─── onRegister ───────────────────────────────────────────────

  describe('onRegister()', () => {
    beforeEach(async () => {
      const driver = await getDriver();
      await logout();
      await navigateTo(driver, '/auth');
      await driver.wait(until.elementLocated(By.css('form')), 5000);
      const toggleBtn = await driver.findElement(
        By.xpath("//button[contains(text(), 'inscription') or contains(text(), 'Inscription') or contains(text(), \"S'inscrire\")]")
      );
      await toggleBtn.click();
      await driver.sleep(500);
    });

    it('GIVEN valid registration data WHEN onRegister is called THEN should register and navigate', async () => {
      const driver = await getDriver();
      const timestamp = Date.now();
      await driver.findElement(By.css('input[name="username"]')).sendKeys(`user_${timestamp}`);
      await driver.findElement(By.css('input[name="password"]')).sendKeys('password123');
      await driver.findElement(By.css('input[name="adresse"]')).sendKeys('123 Rue Test');
      await driver.findElement(By.css('button[type="submit"]')).click();
      await driver.sleep(3000);
      expect(await driver.getCurrentUrl()).toContain('/home');
    });

    it('GIVEN existing username WHEN onRegister is called THEN should show error message', async () => {
      const driver = await getDriver();
      await driver.findElement(By.css('input[name="username"]')).sendKeys('admin');
      await driver.findElement(By.css('input[name="password"]')).sendKeys('password123');
      await driver.findElement(By.css('input[name="adresse"]')).sendKeys('123 Rue Test');
      await driver.findElement(By.css('button[type="submit"]')).click();
      await driver.sleep(1500);
      const errorMsg = await driver.wait(until.elementLocated(By.css('.error-message, .message.error, [class*="error"]')), 3000);
      expect(await errorMsg.isDisplayed()).toBe(true);
    });
  });
});
