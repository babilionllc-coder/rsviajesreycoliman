const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    const htmlPath = path.resolve(__dirname, '../RS-Viajes-Website-Optimization-Report.html');
    await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Hide the print button
    await page.evaluate(() => {
        const btn = document.querySelector('.print-btn');
        if (btn) btn.style.display = 'none';
    });
    
    const pdfPath = path.resolve(__dirname, '../RS-Viajes-Website-Optimization-Report.pdf');
    await page.pdf({
        path: pdfPath,
        format: 'Letter',
        printBackground: true,
        margin: { top: '0.4in', bottom: '0.4in', left: '0.4in', right: '0.4in' },
        preferCSSPageSize: false,
    });
    
    console.log('PDF saved to:', pdfPath);
    await browser.close();
})();
