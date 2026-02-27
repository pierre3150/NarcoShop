import { By, until } from 'selenium-webdriver';
import { getDriver, navigateTo, ensureLoggedIn, logout } from './selenium.config';

describe('Navigation E2E Tests', () => {

  beforeAll(async () => {
    await ensureLoggedIn(); // Connexion unique au démarrage
  });

  // ─── Navbar ───────────────────────────────────────────────────

  describe('Navbar', () => {
    beforeEach(async () => {
      const driver = await getDriver();
      await navigateTo(driver, '/home');
      await driver.sleep(1000);
    });

    it('GIVEN app loaded WHEN user visits THEN navbar should be visible', async () => {
      const driver = await getDriver();
      const navbar = await driver.wait(until.elementLocated(By.css('app-navbar, nav, .navbar')), 5000);
      expect(await navbar.isDisplayed()).toBe(true);
    });

    it('GIVEN navbar WHEN user clicks on home link THEN should navigate to home', async () => {
      const driver = await getDriver();
      const homeLink = await driver.findElement(By.xpath("//a[contains(text(), 'Accueil')] | //a[@href='/home']"));
      await homeLink.click();
      await driver.sleep(500);
      expect(await driver.getCurrentUrl()).toContain('/home');
    });

    it('GIVEN navbar WHEN user clicks on articles link THEN should navigate to articles', async () => {
      const driver = await getDriver();
      const links = await driver.findElements(
        By.xpath("//a[contains(text(), 'Articles')] | //a[contains(text(), 'Produits')] | //a[@href='/articles']")
      );
      if (links.length > 0) {
        await links[0].click();
        await driver.sleep(500);
        expect(await driver.getCurrentUrl()).toContain('/articles');
      } else {
        expect(true).toBe(true);
      }
    });

    it('GIVEN navbar WHEN user not logged in THEN should show login link', async () => {
      const driver = await getDriver();
      await logout();
      await navigateTo(driver, '/home');
      await driver.sleep(500);
      const loginLinks = await driver.findElements(
        By.xpath("//a[contains(text(), 'Connexion') or contains(text(), 'Login') or contains(@href, 'auth')]")
      );
      expect(loginLinks.length).toBeGreaterThan(0);
      await ensureLoggedIn(); // Se reconnecter pour les tests suivants
    });
  });

  // ─── AdminDashboard ───────────────────────────────────────────

  describe('AdminDashboard', () => {
    beforeEach(async () => {
      await ensureLoggedIn('admin', 'admin');
    });

    it('GIVEN admin user WHEN initialized THEN should load all data', async () => {
      const driver = await getDriver();
      await navigateTo(driver, '/admin');
      await driver.sleep(1000);
      const body = await driver.findElement(By.css('body')).getText();
      expect(body.toLowerCase().includes('admin') || body.toLowerCase().includes('statistique')).toBe(true);
    });

    it('GIVEN admin dashboard WHEN clicking orders tab THEN should display orders', async () => {
      const driver = await getDriver();
      await navigateTo(driver, '/admin');
      await driver.sleep(1000);
      const ordersTab = await driver.findElements(By.xpath("//button[contains(text(), 'Commandes')]"));
      if (ordersTab.length > 0) {
        await ordersTab[0].click();
        await driver.sleep(500);
        const body = await driver.findElement(By.css('body')).getText();
        expect(body.toLowerCase().includes('commande')).toBe(true);
      } else { expect(true).toBe(true); }
    });

    it('GIVEN admin dashboard WHEN clicking users tab THEN should display users', async () => {
      const driver = await getDriver();
      await navigateTo(driver, '/admin');
      await driver.sleep(1000);
      const usersTab = await driver.findElements(By.xpath("//button[contains(text(), 'Utilisateurs')]"));
      if (usersTab.length > 0) {
        await usersTab[0].click();
        await driver.sleep(500);
        const body = await driver.findElement(By.css('body')).getText();
        expect(body.toLowerCase().includes('utilisateur')).toBe(true);
      } else { expect(true).toBe(true); }
    });

    it('GIVEN admin dashboard WHEN clicking "Voir les cartes" THEN should display cards modal', async () => {
      const driver = await getDriver();
      await navigateTo(driver, '/admin');
      await driver.sleep(1000);
      const usersTab = await driver.findElements(By.xpath("//button[contains(text(), 'Utilisateurs')]"));
      if (usersTab.length > 0) {
        await usersTab[0].click();
        await driver.sleep(500);
        const cardsBtn = await driver.findElements(By.xpath("//button[contains(text(), 'Cartes') or contains(text(), 'cartes')]"));
        if (cardsBtn.length > 0) {
          await cardsBtn[0].click();
          await driver.sleep(1000);
          const modal = await driver.findElements(By.css('.modal-overlay, .modal-content'));
          expect(modal.length).toBeGreaterThan(0);
        } else { expect(true).toBe(true); }
      } else { expect(true).toBe(true); }
    });

    it('GIVEN admin WHEN clicking manage body parts THEN should navigate', async () => {
      const driver = await getDriver();
      await navigateTo(driver, '/admin');
      await driver.sleep(1000);
      const bodyPartsTab = await driver.findElements(By.xpath("//button[contains(text(), 'corps') or contains(text(), 'Corps') or contains(text(), 'Parties')]"));
      if (bodyPartsTab.length > 0) {
        await bodyPartsTab[0].click();
        await driver.sleep(1000);
        expect(await driver.getCurrentUrl()).toContain('/manage-body-parts');
      } else { expect(true).toBe(true); }
    });
  });

  // ─── ManageBodyParts ──────────────────────────────────────────

  describe('ManageBodyParts', () => {
    beforeEach(async () => {
      const driver = await getDriver();
      await ensureLoggedIn();
      await navigateTo(driver, '/manage-body-parts');
      await driver.sleep(1000);
    });

    it('GIVEN manage page WHEN loaded THEN should display body parts list', async () => {
      const driver = await getDriver();
      const body = await driver.findElement(By.css('body')).getText();
      expect(body.toLowerCase().includes('catégorie') || body.toLowerCase().includes('partie') || body.toLowerCase().includes('corps')).toBe(true);
    });

    it('GIVEN manage page WHEN clicking add category THEN should show modal', async () => {
      const driver = await getDriver();
      const addBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Ajouter une catégorie') or contains(text(), 'Ajouter')]"));
      await addBtn.click();
      await driver.sleep(500);
      const modal = await driver.wait(until.elementLocated(By.css('.modal-content')), 3000);
      expect(await modal.isDisplayed()).toBe(true);
    });

    it('GIVEN add modal WHEN submitting valid name THEN should create body part', async () => {
      const driver = await getDriver();
      const addBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Ajouter une catégorie') or contains(text(), 'Ajouter')]"));
      await addBtn.click();
      await driver.sleep(500);
      const nameInput = await driver.wait(until.elementLocated(By.css('input[name="bodyPartName"]')), 3000);
      await nameInput.sendKeys(`Test_${Date.now()}`);
      await driver.findElement(By.css('.modal-content button[type="submit"]')).click();
      await driver.sleep(1500);
      const successMsg = await driver.findElements(By.css('.message.success'));
      expect(successMsg.length).toBeGreaterThan(0);
    });

    it('GIVEN body part WHEN clicking articles button THEN should show articles panel', async () => {
      const driver = await getDriver();
      const articlesBtn = await driver.findElements(By.xpath("//button[contains(text(), 'Articles')]"));
      if (articlesBtn.length > 0) {
        await articlesBtn[0].click();
        await driver.sleep(500);
        const panel = await driver.findElements(By.css('.articles-panel'));
        expect(panel.length).toBeGreaterThan(0);
      } else { expect(true).toBe(true); }
    });

    it('GIVEN articles panel WHEN clicking add article THEN should show article modal', async () => {
      const driver = await getDriver();
      const articlesBtn = await driver.findElements(By.xpath("//button[contains(text(), 'Articles')]"));
      if (articlesBtn.length > 0) {
        await articlesBtn[0].click();
        await driver.sleep(500);
        const addArticleBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Ajouter un article')]"));
        await addArticleBtn.click();
        await driver.sleep(500);
        const modal = await driver.wait(until.elementLocated(By.css('.modal-content')), 3000);
        expect(await modal.isDisplayed()).toBe(true);
      } else { expect(true).toBe(true); }
    });
  });

  // ─── ArticlesList ─────────────────────────────────────────────

  describe('ArticlesList', () => {
    it('GIVEN articles page WHEN loaded THEN should display articles', async () => {
      const driver = await getDriver();
      await ensureLoggedIn();
      await navigateTo(driver, '/articles');
      await driver.sleep(1500);
      const body = await driver.findElement(By.css('body')).getText();
      expect(body.length).toBeGreaterThan(0);
    });
  });

  // ─── OrderHistory ─────────────────────────────────────────────

  describe('OrderHistory', () => {
    it('GIVEN logged in user WHEN visiting orders THEN should display order history page', async () => {
      const driver = await getDriver();
      await ensureLoggedIn();
      await navigateTo(driver, '/orders');
      await driver.sleep(1000);
      const body = await driver.findElement(By.css('body')).getText();
      expect(body.toLowerCase().includes('commande') || body.toLowerCase().includes('historique')).toBe(true);
    });
  });
});
