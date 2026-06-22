const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 }
  });
  
  await page.goto('http://localhost:8081');
  // Wait for the dashboard to load (SummaryStatCards)
  await page.waitForTimeout(3000); 

  const imgPath = 'C:/Users/learo/.gemini/antigravity/brain/8c3b3e67-0d01-4076-beb8-89144431fd19/dashboard_output.png';
  await page.screenshot({ path: imgPath });
  
  await browser.close();
  console.log('Screenshot saved to', imgPath);
})();
