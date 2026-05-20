import { By, until } from 'selenium-webdriver';
import { getDriver, quitDriver, navigateTo, logout } from './selenium.config';

const TEST_USER = `testuser_${Date.now()}`;
const TEST_PASSWORD = 'password123';

beforeAll(async () => {
  await getDriver();
}, 30000);

afterAll(async () => {
  await quitDriver();
}, 30000);

describe('Scénario complet', () => {

  it('1 - Se connecter avec le compte admin2', async () => {
    const driver = await getDriver();
    await logout();
    await navigateTo(driver, '/auth');
    await driver.sleep(1500);

    await driver.wait(until.elementLocated(By.css('.auth-form-container.active input[name="loginUsername"]')), 8000);
    await driver.sleep(500);
    await driver.findElement(By.css('.auth-form-container.active input[name="loginUsername"]')).sendKeys('admin2');
    await driver.sleep(500);
    await driver.findElement(By.css('.auth-form-container.active input[name="loginPassword"]')).sendKeys('admin1234');
    await driver.sleep(500);
    await driver.findElement(By.css('.auth-form-container.active button[type="submit"]')).click();

    await driver.wait(until.urlContains('/home'), 10000);
    await driver.sleep(1500);
    expect(await driver.getCurrentUrl()).toContain('/home');
  }, 30000);

  it('2 - Naviguer sur la page des articles', async () => {
    const driver = await getDriver();
    await navigateTo(driver, '/articles');
    await driver.sleep(1500);

    await driver.wait(until.urlContains('/articles'), 5000);
    expect(await driver.getCurrentUrl()).toContain('/articles');
  }, 20000);

  it('3 - Naviguer sur la page du panier', async () => {
    const driver = await getDriver();
    await navigateTo(driver, '/cart');
    await driver.sleep(1500);

    await driver.wait(until.urlContains('/cart'), 5000);
    expect(await driver.getCurrentUrl()).toContain('/cart');
  }, 20000);

  it('4 - Se déconnecter', async () => {
    const driver = await getDriver();
    await logout();
    await driver.sleep(1000);
    await navigateTo(driver, '/home');
    await driver.sleep(1000);

    const stored = await driver.executeScript(`return localStorage.getItem('currentUser');`);
    expect(stored).toBeNull();
  }, 20000);

  it('5 - Créer un nouveau compte', async () => {
    const driver = await getDriver();
    await navigateTo(driver, '/auth');
    await driver.sleep(1500);

    await driver.wait(until.elementLocated(By.css('.auth-form-container.active .btn-link')), 8000);
    await driver.sleep(500);
    await driver.findElement(By.css('.auth-form-container.active .btn-link')).click();
    await driver.sleep(2000);

    await driver.wait(until.elementLocated(By.css('.auth-form-container.active input[name="registerUsername"]')), 8000);
    await driver.sleep(500);

    await driver.findElement(By.css('.auth-form-container.active input[name="registerUsername"]')).sendKeys(TEST_USER);
    await driver.sleep(500);
    await driver.findElement(By.css('.auth-form-container.active input[name="registerPassword"]')).sendKeys(TEST_PASSWORD);
    await driver.sleep(500);

    const adresseFields = await driver.findElements(By.css('.auth-form-container.active textarea[name="registerAdresse"]'));
    if (adresseFields.length > 0) {
      await adresseFields[0].sendKeys('1 rue test');
      await driver.sleep(500);
    }

    await driver.findElement(By.css('.auth-form-container.active button[type="submit"]')).click();
    await driver.sleep(3000);

    expect(await driver.getCurrentUrl()).toContain('/home');
  }, 40000);

  it('6 - Se déconnecter puis se reconnecter avec le nouveau compte', async () => {
    const driver = await getDriver();
    await logout();
    await driver.sleep(1000);
    await navigateTo(driver, '/auth');
    await driver.sleep(1500);

    await driver.wait(until.elementLocated(By.css('.auth-form-container.active input[name="loginUsername"]')), 8000);
    await driver.sleep(500);
    await driver.findElement(By.css('.auth-form-container.active input[name="loginUsername"]')).sendKeys(TEST_USER);
    await driver.sleep(500);
    await driver.findElement(By.css('.auth-form-container.active input[name="loginPassword"]')).sendKeys(TEST_PASSWORD);
    await driver.sleep(500);
    await driver.findElement(By.css('.auth-form-container.active button[type="submit"]')).click();

    await driver.wait(until.urlContains('/home'), 10000);
    await driver.sleep(1500);
    expect(await driver.getCurrentUrl()).toContain('/home');
  }, 35000);

  it('7 - Se connecter avec un mauvais mot de passe', async () => {
    const driver = await getDriver();
    await logout();
    await driver.sleep(1000);
    await navigateTo(driver, '/auth');
    await driver.sleep(1500);

    await driver.wait(until.elementLocated(By.css('.auth-form-container.active input[name="loginUsername"]')), 8000);
    await driver.sleep(500);
    await driver.findElement(By.css('.auth-form-container.active input[name="loginUsername"]')).sendKeys(TEST_USER);
    await driver.sleep(500);
    await driver.findElement(By.css('.auth-form-container.active input[name="loginPassword"]')).sendKeys('mauvaismdp');
    await driver.sleep(500);
    await driver.findElement(By.css('.auth-form-container.active button[type="submit"]')).click();
    await driver.sleep(500);

    expect(await driver.getCurrentUrl()).toContain('/auth');

    const errors = await driver.findElements(By.css('.form-message.error, .error-message, [class*="error"]'));
    const visible = await Promise.all(errors.map(e => e.isDisplayed().catch(() => false)));
    expect((visible as boolean[]).some(v => v)).toBe(true);
  }, 30000);

  it('8 - Se reconnecter avec le nouveau compte et supprimer son compte', async () => {
    const driver = await getDriver();

    // Se reconnecter avec le compte créé au test 5
    await navigateTo(driver, '/auth');
    await driver.sleep(1500);

    await driver.wait(until.elementLocated(By.css('.auth-form-container.active input[name="loginUsername"]')), 8000);
    await driver.findElement(By.css('.auth-form-container.active input[name="loginUsername"]')).sendKeys(TEST_USER);
    await driver.sleep(500);
    await driver.findElement(By.css('.auth-form-container.active input[name="loginPassword"]')).sendKeys(TEST_PASSWORD);
    await driver.sleep(500);
    await driver.findElement(By.css('.auth-form-container.active button[type="submit"]')).click();

    await driver.wait(until.urlContains('/home'), 10000);
    await driver.sleep(1500);

    // Naviguer vers les paramètres
    await navigateTo(driver, '/settings');
    await driver.sleep(1500);
    await driver.wait(until.urlContains('/settings'), 5000);

    // Cliquer sur le bouton "Supprimer mon compte"
    await driver.wait(until.elementLocated(By.css('.btn-delete-account')), 8000);
    await driver.sleep(500);
    await driver.findElement(By.css('.btn-delete-account')).click();
    await driver.sleep(500);

    // Accepter la première boîte de confirmation
    await driver.switchTo().alert().accept();
    await driver.sleep(500);

    // Saisir le nom d'utilisateur dans le prompt de confirmation
    const prompt = await driver.switchTo().alert();
    await prompt.sendKeys(TEST_USER);
    await prompt.accept();
    await driver.sleep(2000);

    // Vérifier la redirection vers /auth après suppression
    await driver.wait(until.urlContains('/auth'), 10000);
    expect(await driver.getCurrentUrl()).toContain('/auth');

    // Vérifier que le localStorage est vide (déconnexion effective)
    const stored = await driver.executeScript(`return localStorage.getItem('currentUser');`);
    expect(stored).toBeNull();
  }, 45000);

});
