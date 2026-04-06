import puppeteer from 'puppeteer';
import path from 'path';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const filePath = path.resolve('report.html');
  await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' });
  
  await page.pdf({
    path: '/Users/mac/Desktop/RS_Viajes_SEO_AEO_Report.pdf',
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20px',
      right: '20px',
      bottom: '20px',
      left: '20px'
    }
  });

  await browser.close();
  console.log('PDF generated successfully at /Users/mac/Desktop/RS_Viajes_SEO_AEO_Report.pdf');
})();
