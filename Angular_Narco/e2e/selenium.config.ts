import { Builder, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import { ServiceBuilder } from 'selenium-webdriver/chrome';
import * as path from 'path';

export const BASE_URL = 'http://localhost:4200';

const isWindows = process.platform === 'win32';
const chromedriverBin = isWindows ? 'chromedriver.exe' : 'chromedriver';
const chromedriverPath = path.join(
  process.cwd(),
  'node_modules', 'chromedriver', 'lib', 'chromedriver', chromedriverBin
);

let sharedDriver: WebDriver | null = null;

export async function getDriver(): Promise<WebDriver> {
  if (!sharedDriver) {
    const options = new chrome.Options();
    if (!isWindows) {
      options.addArguments('--headless=new');
    }
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

    await sharedDriver.get(`${BASE_URL}/home`);
    await sharedDriver.sleep(2000);
  }
  return sharedDriver;
}

export async function quitDriver(): Promise<void> {
  if (sharedDriver) {
    await sharedDriver.quit();
    sharedDriver = null;
  }
}

export async function logout(): Promise<void> {
  const driver = await getDriver();
  await driver.executeScript(`localStorage.removeItem('currentUser'); sessionStorage.clear();`);
  await driver.navigate().refresh();
  await driver.sleep(600);
}

export async function navigateTo(driver: WebDriver, p: string): Promise<void> {
  await driver.get(`${BASE_URL}${p}`);
  await driver.sleep(400);
}
