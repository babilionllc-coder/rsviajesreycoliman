const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new'
  });
  const page = await browser.newPage();
  
  // Set explicit media to screen to force exact styles
  await page.emulateMediaType('screen');
  
  await page.goto('file:///Users/mac/Desktop/Websites/rsviajes/report.html', {
    waitUntil: 'networkidle0',
  });
  
  await page.pdf({
    path: '/Users/mac/Desktop/RS_Viajes_SEO_AEO_Report.pdf',
    printBackground: true,
    format: 'A4',
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });
  
  await browser.close();
  console.log('PDF rendered perfectly with backgrounds!');
})();
