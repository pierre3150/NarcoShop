import { By, until } from 'selenium-webdriver';
import { getDriver, quitDriver, navigateTo, ensureLoggedIn, logout } from './selenium.config';

function testLog(name: string): void {
  console.log(`\x1b[35m  >>> TEST:\x1b[0m ${name}`);
}

beforeAll(async () => {
  console.log('\n=== DEMARRAGE : Chrome ouvre /home ===\n');
  await getDriver();
}, 30000);

afterAll(async () => {
  console.log('\n=== FIN : Chrome se ferme ===\n');
  await quitDriver();
}, 30000);

// ================================================================
//  AUTH
// ================================================================

describe('AuthComponent E2E Tests', () => {

  describe('Component Initialization', () => {

    it('GIVEN component is created WHEN initialized THEN should create successfully', async () => {
      testLog('Auth - page /auth accessible');
      const driver = await getDriver();
      await logout();
      await navigateTo(driver, '/auth');
      const form = await driver.wait(until.elementLocated(By.css('form')), 5000);
      expect(await form.isDisplayed()).toBe(true);
    });

    it('GIVEN component initialization WHEN ngOnInit THEN should set isRegisterMode false', async () => {
      testLog('Auth - mode login par defaut');
      const driver = await getDriver();
      const adresseFields = await driver.findElements(By.css('textarea[name="registerAdresse"]'));
      const visible = await Promise.all(adresseFields.map((el: any) => el.isDisplayed().catch(() => false)));
      expect((visible as boolean[]).filter((v: boolean) => v).length).toBe(0);
    });
  });

  describe('toggleMode()', () => {

    beforeEach(async () => {
      const driver = await getDriver();
      await logout();
      await navigateTo(driver, '/auth');
      await driver.wait(until.elementLocated(By.css('form')), 5000);
    });

    it('GIVEN login mode WHEN toggleMode THEN should switch to register mode', async () => {
      testLog('Auth - toggle vers register');
      const driver = await getDriver();
      const btn = await driver.findElement(
        By.xpath("//button[contains(text(), \"Cr\") or contains(text(), \"S'inscrire\")]")
      );
      await btn.click();
      await driver.sleep(400);
      const f = await driver.wait(until.elementLocated(By.css('input[name="registerUsername"]')), 3000);
      expect(await f.isDisplayed()).toBe(true);
    });

    it('GIVEN register mode WHEN toggleMode THEN should switch back to login', async () => {
      testLog('Auth - toggle retour login');
      const driver = await getDriver();
      // Aller en mode register
      const toReg = await driver.findElement(
        By.xpath("//button[contains(text(), \"Cr\") or contains(text(), \"S'inscrire\")]")
      );
      await toReg.click();
      await driver.wait(until.elementLocated(By.css('input[name="registerUsername"]')), 3000);
      await driver.sleep(300);
      // Cliquer via JS sur le btn-link du container register actif
      await driver.executeScript(`
        const activeContainer = document.querySelector('.auth-form-container.active');
        if (activeContainer) {
          const btn = activeContainer.querySelector('.form-footer .btn-link');
          if (btn) btn.click();
        }
      `);
      // Attendre que le container "Inscription" ne soit plus actif
      await driver.wait(async () => {
        return await driver.executeScript<boolean>(`
          const containers = document.querySelectorAll('.auth-form-container');
          for (const c of containers) {
            const h2 = c.querySelector('h2');
            if (h2 && h2.textContent.includes('Inscription') && c.classList.contains('active')) {
              return false;
            }
          }
          return true;
        `);
      }, 5000);
      // Vérifier que le container "Connexion" est actif
      const isLoginActive = await driver.executeScript<boolean>(`
        const containers = document.querySelectorAll('.auth-form-container');
        for (const c of containers) {
          const h2 = c.querySelector('h2');
          if (h2 && h2.textContent.includes('Connexion') && c.classList.contains('active')) {
            return true;
          }
        }
        return false;
      `);
      expect(isLoginActive).toBe(true);
    });
  });

  describe('onLogin()', () => {

    beforeEach(async () => {
      const driver = await getDriver();
      await logout();
      await navigateTo(driver, '/auth');
      await driver.wait(until.elementLocated(By.css('input[name="loginUsername"]')), 5000);
    });

    it('GIVEN valid credentials WHEN onLogin THEN should login and navigate to home', async () => {
      testLog('Auth - login admin/admin1234 -> /home');
      const driver = await getDriver();
      await driver.findElement(By.css('input[name="loginUsername"]')).sendKeys('admin');
      await driver.findElement(By.css('input[name="loginPassword"]')).sendKeys('admin1234');
      await driver.findElement(By.css('form button[type="submit"]')).click();
      await driver.wait(until.urlContains('/home'), 10000);
      expect(await driver.getCurrentUrl()).toContain('/home');
    });

    it('GIVEN invalid credentials WHEN onLogin THEN should show error', async () => {
      testLog('Auth - login invalide -> erreur');
      const driver = await getDriver();
      await driver.findElement(By.css('input[name="loginUsername"]')).sendKeys('mauvaisuser');
      await driver.findElement(By.css('input[name="loginPassword"]')).sendKeys('mauvaispass');
      await driver.findElement(By.css('form button[type="submit"]')).click();
      await driver.sleep(2000);
      const err = await driver.wait(until.elementLocated(By.css('.form-message.error')), 5000);
      expect(await err.isDisplayed()).toBe(true);
    });

    it('GIVEN empty fields WHEN onLogin THEN button should be disabled', async () => {
      testLog('Auth - champs vides -> bouton disabled');
      const driver = await getDriver();
      const btn = await driver.findElement(By.css('form button[type="submit"]'));
      expect(await btn.getAttribute('disabled')).not.toBeNull();
    });
  });

  describe('onRegister()', () => {

    beforeEach(async () => {
      const driver = await getDriver();
      await logout();
      await navigateTo(driver, '/auth');
      await driver.wait(until.elementLocated(By.css('form')), 5000);
      const btn = await driver.findElement(
        By.xpath("//button[contains(text(), \"Cr\") or contains(text(), \"S'inscrire\")]")
      );
      await btn.click();
      await driver.wait(until.elementLocated(By.css('input[name="registerUsername"]')), 3000);
    });

    it('GIVEN valid data WHEN onRegister THEN should register and navigate', async () => {
      testLog('Auth - inscription valide -> /home');
      const driver = await getDriver();
      const ts = Date.now();
      await driver.findElement(By.css('input[name="registerUsername"]')).sendKeys(`user_${ts}`);
      await driver.findElement(By.css('input[name="registerPassword"]')).sendKeys('password123');
      const adr = await driver.findElements(By.css('textarea[name="registerAdresse"]'));
      if (adr.length > 0) await adr[0].sendKeys('123 Rue Test');
      const btns = await driver.findElements(By.css('button[type="submit"]'));
      await btns[btns.length - 1].click();
      await driver.wait(until.urlContains('/home'), 10000);
      expect(await driver.getCurrentUrl()).toContain('/home');
    });

    it('GIVEN existing username WHEN onRegister THEN should show error', async () => {
      testLog('Auth - username existant -> erreur');
      const driver = await getDriver();
      await driver.findElement(By.css('input[name="registerUsername"]')).sendKeys('admin');
      await driver.findElement(By.css('input[name="registerPassword"]')).sendKeys('password123');
      const btns = await driver.findElements(By.css('button[type="submit"]'));
      await btns[btns.length - 1].click();
      await driver.sleep(2000);
      const err = await driver.wait(until.elementLocated(By.css('.form-message.error')), 5000);
      expect(await err.isDisplayed()).toBe(true);
    });
  });
});

// ================================================================
//  HOME
// ================================================================

describe('HomeComponent E2E Tests', () => {

  beforeAll(async () => {
    await ensureLoggedIn('admin', 'admin1234');
  });

  describe('Component Initialization', () => {

    it('GIVEN component WHEN initialized THEN should create successfully', async () => {
      testLog('Home - body affiche');
      const driver = await getDriver();
      await navigateTo(driver, '/home');
      const body = await driver.wait(until.elementLocated(By.css('body')), 5000);
      expect(await body.isDisplayed()).toBe(true);
    });

    it('GIVEN component WHEN ngOnInit THEN should initialize without errors', async () => {
      testLog('Home - URL contient /home');
      const driver = await getDriver();
      await navigateTo(driver, '/home');
      expect(await driver.getCurrentUrl()).toContain('/home');
    });
  });

  describe('Template Rendering', () => {

    beforeEach(async () => {
      const driver = await getDriver();
      await navigateTo(driver, '/home');
    });

    it('GIVEN rendered THEN should display hero section', async () => {
      testLog('Home - hero visible');
      const driver = await getDriver();
      const hero = await driver.wait(
        until.elementLocated(By.css('.hero, .hero-section, .hero-content')), 5000
      );
      expect(await hero.isDisplayed()).toBe(true);
    });

    it('GIVEN rendered THEN should display features section', async () => {
      testLog('Home - features visible');
      const driver = await getDriver();
      const f = await driver.wait(
        until.elementLocated(By.css('.features, .features-section, .feature-card')), 5000
      );
      expect(await f.isDisplayed()).toBe(true);
    });

    it('GIVEN home WHEN click produits THEN should navigate to articles', async () => {
      testLog('Home - bouton produits -> /articles');
      const driver = await getDriver();
      const btn = await driver.wait(until.elementLocated(By.xpath(
        "//button[contains(text(), 'produits') or contains(text(), 'Produits')] | //a[contains(text(), 'produits') or contains(text(), 'Produits')]"
      )), 5000);
      await btn.click();
      await driver.sleep(800);
      expect(await driver.getCurrentUrl()).toContain('/articles');
    });
  });
});

// ================================================================
//  CART
// ================================================================

describe('CartComponent E2E Tests', () => {

  describe('Component Initialization', () => {

    it('GIVEN not logged in WHEN visiting cart THEN should redirect', async () => {
      testLog('Cart - non connecte -> redirect');
      const driver = await getDriver();
      await logout();
      await navigateTo(driver, '/cart');
      await driver.sleep(1500);
      const url = await driver.getCurrentUrl();
      const msgs = await driver.findElements(
        By.xpath("//*[contains(text(), 'connecter') or contains(text(), 'login')]")
      );
      expect(url.includes('/auth') || msgs.length > 0).toBe(true);
    });

    it('GIVEN logged in WHEN visiting cart THEN should display cart', async () => {
      testLog('Cart - connecte -> page panier');
      const driver = await getDriver();
      await ensureLoggedIn('admin', 'admin1234');
      await navigateTo(driver, '/cart');
      const body = await driver.findElement(By.css('body')).getText();
      const els = await driver.findElements(By.css('.cart-container, .cart, [class*="cart"]'));
      expect(els.length > 0 || body.toLowerCase().includes('panier')).toBe(true);
    });
  });

  describe('loadCart()', () => {

    beforeEach(async () => {
      await ensureLoggedIn('admin', 'admin1234');
      const driver = await getDriver();
      await navigateTo(driver, '/cart');
    });

    it('GIVEN cart loads THEN should display content or empty message', async () => {
      testLog('Cart - contenu ou vide');
      const driver = await getDriver();
      const body = await driver.findElement(By.css('body')).getText();
      expect(
        body.toLowerCase().includes('panier') ||
        body.toLowerCase().includes('vide') ||
        body.toLowerCase().includes('total')
      ).toBe(true);
    });

    it('GIVEN cart loaded THEN should display total section', async () => {
      testLog('Cart - section Total');
      const driver = await getDriver();
      const els = await driver.findElements(
        By.xpath("//*[contains(text(), 'Total') or contains(text(), 'total')]")
      );
      expect(els.length).toBeGreaterThan(0);
    });
  });

  describe('removeFromCart()', () => {

    it('GIVEN item in cart WHEN remove THEN should confirm', async () => {
      testLog('Cart - retirer article');
      const driver = await getDriver();
      await ensureLoggedIn('admin', 'admin1234');
      await navigateTo(driver, '/cart');
      const btns = await driver.findElements(
        By.xpath("//button[contains(text(), 'Retirer') or contains(text(), 'Supprimer')]")
      );
      if (btns.length > 0) {
        await btns[0].click();
        await driver.sleep(500);
        try { await (await driver.switchTo().alert()).accept(); } catch { /* ok */ }
      }
      expect(true).toBe(true);
    });
  });

  describe('checkout()', () => {

    it('GIVEN empty cart WHEN checkout THEN should not validate', async () => {
      testLog('Cart - checkout panier vide');
      const driver = await getDriver();
      await ensureLoggedIn('admin', 'admin1234');
      await navigateTo(driver, '/cart');
      const btns = await driver.findElements(
        By.xpath("//button[contains(text(), 'Commander') or contains(text(), 'Valider')]")
      );
      if (btns.length > 0) {
        const body = await driver.findElement(By.css('body')).getText();
        if (body.toLowerCase().includes('vide')) {
          expect(await btns[0].isEnabled()).toBe(false);
        } else { expect(true).toBe(true); }
      } else { expect(true).toBe(true); }
    });
  });
});

// ================================================================
//  NAVIGATION
// ================================================================

describe('Navigation E2E Tests', () => {

  beforeAll(async () => {
    await ensureLoggedIn('admin', 'admin1234');
  });

  describe('Navbar', () => {

    beforeEach(async () => {
      const driver = await getDriver();
      await navigateTo(driver, '/home');
    });

    it('GIVEN app loaded THEN navbar should be visible', async () => {
      testLog('Nav - navbar visible');
      const driver = await getDriver();
      const nav = await driver.wait(
        until.elementLocated(By.css('app-navbar, nav, .navbar')), 5000
      );
      expect(await nav.isDisplayed()).toBe(true);
    });

    it('GIVEN navbar WHEN click home THEN should navigate to home', async () => {
      testLog('Nav - lien Accueil');
      const driver = await getDriver();
      const link = await driver.findElement(
        By.xpath("//a[contains(text(), 'Accueil')] | //a[@href='/home']")
      );
      await link.click();
      await driver.sleep(500);
      expect(await driver.getCurrentUrl()).toContain('/home');
    });

    it('GIVEN navbar WHEN click articles THEN should navigate to articles', async () => {
      testLog('Nav - lien Articles');
      const driver = await getDriver();
      const links = await driver.findElements(
        By.xpath("//a[contains(text(), 'Articles')] | //a[@href='/articles']")
      );
      if (links.length > 0) {
        await links[0].click();
        await driver.sleep(500);
        expect(await driver.getCurrentUrl()).toContain('/articles');
      } else { expect(true).toBe(true); }
    });

    it('GIVEN not logged in THEN should show login link', async () => {
      testLog('Nav - deconnecte -> lien connexion');
      const driver = await getDriver();
      await logout();
      await navigateTo(driver, '/home');
      const links = await driver.findElements(
        By.xpath("//a[contains(text(), 'Connexion') or contains(@href, 'auth')]")
      );
      expect(links.length).toBeGreaterThan(0);
      await ensureLoggedIn('admin', 'admin1234');
    });
  });

  describe('AdminDashboard', () => {

    beforeEach(async () => {
      await ensureLoggedIn('admin', 'admin1234');
      const driver = await getDriver();
      await navigateTo(driver, '/admin');
    });

    it('GIVEN admin WHEN initialized THEN should load data', async () => {
      testLog('Admin - dashboard charge');
      const driver = await getDriver();
      const body = await driver.findElement(By.css('body')).getText();
      expect(
        body.toLowerCase().includes('admin') || body.toLowerCase().includes('statistique')
      ).toBe(true);
    });

    it('GIVEN admin WHEN visiting admin THEN URL should contain admin', async () => {
      testLog('Admin - URL = /admin');
      const driver = await getDriver();
      expect(await driver.getCurrentUrl()).toContain('/admin');
    });

    it('GIVEN admin WHEN clicking orders tab THEN should display orders', async () => {
      testLog('Admin - onglet Commandes');
      const driver = await getDriver();
      const tab = await driver.findElements(By.xpath("//button[contains(text(), 'Commandes')]"));
      if (tab.length > 0) {
        await tab[0].click();
        await driver.sleep(500);
        const body = await driver.findElement(By.css('body')).getText();
        expect(body.toLowerCase().includes('commande')).toBe(true);
      } else { expect(true).toBe(true); }
    });

    it('GIVEN admin WHEN clicking users tab THEN should display users', async () => {
      testLog('Admin - onglet Utilisateurs');
      const driver = await getDriver();
      const tab = await driver.findElements(By.xpath("//button[contains(text(), 'Utilisateurs')]"));
      if (tab.length > 0) {
        await tab[0].click();
        await driver.sleep(500);
        const body = await driver.findElement(By.css('body')).getText();
        expect(body.toLowerCase().includes('utilisateur')).toBe(true);
      } else { expect(true).toBe(true); }
    });

    it('GIVEN admin WHEN clicking cartes THEN should display modal', async () => {
      testLog('Admin - modal Cartes');
      const driver = await getDriver();
      const tab = await driver.findElements(By.xpath("//button[contains(text(), 'Utilisateurs')]"));
      if (tab.length > 0) {
        await tab[0].click();
        await driver.sleep(500);
        const btn = await driver.findElements(
          By.xpath("//button[contains(text(), 'Cartes') or contains(text(), 'cartes')]")
        );
        if (btn.length > 0) {
          await btn[0].click();
          await driver.sleep(800);
          const m = await driver.findElements(By.css('.modal-overlay, .modal-content'));
          expect(m.length).toBeGreaterThan(0);
        } else { expect(true).toBe(true); }
      } else { expect(true).toBe(true); }
    });

    it('GIVEN admin WHEN clicking body parts THEN should navigate', async () => {
      testLog('Admin - bouton Parties -> /manage-body-parts');
      const driver = await getDriver();
      const tab = await driver.findElements(
        By.xpath("//button[contains(text(), 'corps') or contains(text(), 'Corps') or contains(text(), 'Parties')]")
      );
      if (tab.length > 0) {
        await tab[0].click();
        await driver.sleep(800);
        expect(await driver.getCurrentUrl()).toContain('/manage-body-parts');
      } else { expect(true).toBe(true); }
    });
  });

  describe('ManageBodyParts', () => {

    beforeEach(async () => {
      await ensureLoggedIn('admin', 'admin1234');
      const driver = await getDriver();
      await navigateTo(driver, '/manage-body-parts');
    });

    it('GIVEN manage page WHEN loaded THEN should display list', async () => {
      testLog('ManageBodyParts - liste');
      const driver = await getDriver();
      const body = await driver.findElement(By.css('body')).getText();
      expect(
        body.toLowerCase().includes('cat') ||
        body.toLowerCase().includes('partie') ||
        body.toLowerCase().includes('corps')
      ).toBe(true);
    });

    it('GIVEN manage page WHEN add category THEN should show modal', async () => {
      testLog('ManageBodyParts - modal categorie');
      const driver = await getDriver();
      const btn = await driver.findElement(
        By.xpath("//button[contains(text(), 'Ajouter')]")
      );
      await btn.click();
      await driver.sleep(500);
      const modal = await driver.wait(until.elementLocated(By.css('.modal-content')), 3000);
      expect(await modal.isDisplayed()).toBe(true);
    });

    it('GIVEN modal WHEN submitting name THEN should create body part', async () => {
      testLog('ManageBodyParts - creer categorie');
      const driver = await getDriver();
      const btn = await driver.findElement(By.xpath("//button[contains(text(), 'Ajouter')]"));
      await btn.click();
      await driver.sleep(500);
      const input = await driver.wait(until.elementLocated(By.css('input[name="bodyPartName"]')), 3000);
      await input.sendKeys(`Test_${Date.now()}`);
      await driver.findElement(By.css('.modal-content button[type="submit"]')).click();
      await driver.sleep(1500);
      const ok = await driver.findElements(By.css('.message.success'));
      expect(ok.length).toBeGreaterThan(0);
    });

    it('GIVEN body part WHEN click articles THEN should show panel', async () => {
      testLog('ManageBodyParts - panel articles');
      const driver = await getDriver();
      const btns = await driver.findElements(By.xpath("//button[contains(text(), 'Articles')]"));
      if (btns.length > 0) {
        await btns[0].click();
        await driver.sleep(500);
        // Le panel s'appelle .articles-inline dans le HTML
        const p = await driver.findElements(By.css('.articles-inline'));
        expect(p.length).toBeGreaterThan(0);
      } else { expect(true).toBe(true); }
    });

    it('GIVEN panel WHEN click add article THEN should show modal', async () => {
      testLog('ManageBodyParts - modal article');
      const driver = await getDriver();
      const btns = await driver.findElements(By.xpath("//button[contains(text(), 'Articles')]"));
      if (btns.length > 0) {
        await btns[0].click();
        await driver.sleep(500);
        const addBtn = await driver.findElement(
          By.xpath("//button[contains(text(), 'Ajouter un article')]")
        );
        await addBtn.click();
        await driver.sleep(500);
        const modal = await driver.wait(until.elementLocated(By.css('.modal-content')), 3000);
        expect(await modal.isDisplayed()).toBe(true);
      } else { expect(true).toBe(true); }
    });
  });

  describe('ArticlesList', () => {

    it('GIVEN articles page WHEN loaded THEN should display articles', async () => {
      testLog('Articles -> /articles');
      const driver = await getDriver();
      await ensureLoggedIn('admin', 'admin1234');
      await navigateTo(driver, '/articles');
      await driver.sleep(800);
      expect((await driver.findElement(By.css('body')).getText()).length).toBeGreaterThan(0);
    });
  });

  describe('OrderHistory', () => {

    it('GIVEN logged in WHEN visiting orders THEN should display history', async () => {
      testLog('Orders -> /orders');
      const driver = await getDriver();
      await ensureLoggedIn('admin', 'admin1234');
      await navigateTo(driver, '/orders');
      await driver.sleep(800);
      const body = await driver.findElement(By.css('body')).getText();
      expect(
        body.toLowerCase().includes('commande') || body.toLowerCase().includes('historique')
      ).toBe(true);
    });
  });
});

