import { Builder, WebDriver, By, until } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import { ServiceBuilder } from 'selenium-webdriver/chrome';
import * as path from 'path';

export const BASE_URL = 'http://localhost:4200';

const chromedriverPath = path.join(
  process.cwd(),
  'node_modules', 'chromedriver', 'lib', 'chromedriver', 'chromedriver.exe'
);

let sharedDriver: WebDriver | null = null;
let currentLoggedInUser: string | null = null;

// ─── Helper de log ────────────────────────────────────────────
function log(msg: string): void {
  console.log(`\x1b[36m[E2E]\x1b[0m ${msg}`);
}

// ─── Driver singleton ─────────────────────────────────────────
export async function getDriver(): Promise<WebDriver> {
  if (!sharedDriver) {
    log('🚀 Ouverture de Chrome (une seule fois pour toute la suite)');

    const options = new chrome.Options();
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');
    options.addArguments('--disable-notifications');
    options.addArguments('--disable-popup-blocking');

    const service = new ServiceBuilder(chromedriverPath);

    sharedDriver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .setChromeService(service)
      .build();

    await sharedDriver.manage().setTimeouts({
      implicit: 10000,
      pageLoad: 30000,
      script: 30000
    });

    // 1ère navigation : charger l'appli pour créer le contexte localStorage
    log(`📄 Navigation initiale → ${BASE_URL}/home`);
    await sharedDriver.get(`${BASE_URL}/home`);
    await sharedDriver.sleep(2000);
  }
  return sharedDriver;
}

export async function quitDriver(): Promise<void> {
  if (sharedDriver) {
    log('🔴 Fermeture de Chrome');
    await sharedDriver.quit();
    sharedDriver = null;
    currentLoggedInUser = null;
  }
}

// ─── Connexion persistante ────────────────────────────────────
export async function ensureLoggedIn(
  username = 'admin',
  password = 'admin1234'
): Promise<void> {
  const driver = await getDriver();

  // Déjà connecté avec le bon compte → rien à faire, 0 navigation
  if (currentLoggedInUser === username) {
    log(`✅ Déjà connecté en tant que "${username}" — aucune navigation`);
    return;
  }

  // Vérifier le localStorage sans naviguer
  const storedUser = await driver.executeScript<string | null>(
    `return localStorage.getItem('currentUser');`
  );

  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user && user.username === username) {
        log(`✅ Session "${username}" trouvée dans localStorage — aucune navigation`);
        currentLoggedInUser = username;
        return;
      }
    } catch { /* JSON invalide */ }
  }

  // Pas connecté → aller sur /auth et se connecter
  log(`🔐 Connexion requise pour "${username}" → navigation vers /auth`);
  await driver.executeScript(`localStorage.removeItem('currentUser'); sessionStorage.clear();`);
  currentLoggedInUser = null;

  await driver.get(`${BASE_URL}/auth`);
  log(`📄 Arrivée sur /auth — remplissage du formulaire`);
  await driver.wait(until.elementLocated(By.css('input[name="loginUsername"]')), 8000);
  await driver.sleep(300);

  const u = await driver.findElement(By.css('input[name="loginUsername"]'));
  const p = await driver.findElement(By.css('input[name="loginPassword"]'));
  await u.clear(); await u.sendKeys(username);
  await p.clear(); await p.sendKeys(password);
  await driver.findElement(By.css('form:first-of-type button[type="submit"]')).click();

  log(`⏳ Attente de la redirection vers /home après connexion...`);
  await driver.wait(until.urlContains('/home'), 10000);
  await driver.sleep(800);
  log(`✅ Connecté ! URL courante : ${await driver.getCurrentUrl()}`);
  currentLoggedInUser = username;
}

// ─── Déconnexion ──────────────────────────────────────────────
export async function logout(): Promise<void> {
  const driver = await getDriver();
  log(`🚪 Déconnexion (effacement localStorage + refresh)`);
  await driver.executeScript(`localStorage.removeItem('currentUser'); sessionStorage.clear();`);
  currentLoggedInUser = null;
  await driver.navigate().refresh();
  await driver.sleep(600);
}

// ─── Navigation simple ────────────────────────────────────────
export async function navigateTo(driver: WebDriver, p: string): Promise<void> {
  log(`📄 navigateTo → ${BASE_URL}${p}`);
  await driver.get(`${BASE_URL}${p}`);
  await driver.sleep(400);
}
