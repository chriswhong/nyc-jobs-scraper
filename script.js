const URL1 = 'https://a127-jobs.nyc.gov/index.html';
const URL2 = 'https://a127-jobs.nyc.gov/psc/nycjobs/EMPLOYEE/HRMS/c/HRS_HRAM.HRS_APP_SCHJOB.GBL?FOCUS=Applicant&agency=030&'
const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
        width: 1100,
        height: 1000,
    },
  });
  const page = await browser.newPage();
  await page.goto(URL1, { waitUntil : 'networkidle2'});
  await page.goto(URL2, { waitUntil : 'networkidle2'});

  // await page.waitForNavigation(URL, {waitUntil : "networkidle0"});
  await page.select('select[name="HRS_SCH_WRK_BUSINESS_UNIT"]', '030');
  await page.click('input[name="SEARCHACTIONS#SEARCH"]');
  await page.waitFor(1000);

  // scrape the jobs!

  // // go to the next page

  await page.evaluate(() => {
    let [ nextPage ] = document.getElementsByClassName('PTNEXTROW1');
    window.nextPage = nextPage;
    window.nextPage.click();
  });


  await page.screenshot({ path: 'screenshot.png' });

  // browser.close();
}

run();
