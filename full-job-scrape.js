const puppeteer = require('puppeteer');

const { allAgencyJobIds } = require('./tmp/partial.json');

const scrapeJob = async (page) => {
  const data = await page.evaluate(() => {
    const idsToScrape = {
      jobId: 'NYC_DRVD_EHIRE_HRS_JOB_OPENING_ID',
      businessTitle: 'HRS_SCH_WRK2_POSTING_TITLE',
      civilServiceTitle: 'NYC_JOBCODE_TBL_DESCR',
      titleClassification: 'win0divNYC_DRVD_EHIRE_DESCR100lbl',
      jobCategories: 'win0divNYC_DRVD_EHIRE_DESCR254A',
      careerLevel: 'win0divNYC_DRVD_EHIRE_DESCR254C',
      workLocation: 'win0divHRS_LOCATION_I_DESCR',
      workUnit: 'HRS_DEPT_I_DESCR',
      numberOfPositions: 'NYC_DRVD_EHIRE_OPENINGS_TARGET',
      titleCodeNumber: 'win0divNYC_DRVD_EHIRE_NYC_TITLE',
      proposedSalaryRange: 'NYC_DRVD_EHIRE_DESCR50',
    }

    const jobData = {};
    Object.keys(idsToScrape).forEach((key) => {
      jobData[key] = document.getElementById(idsToScrape[key]).innerText;
    });
    return jobData;
  });

  return data;
}

const run = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  for (const agency of allAgencyJobIds) {
    for (const jobId of agency.jobIds) {
      const URL = `https://a127-jobs.nyc.gov/psc/nycjobs/EMPLOYEE/HRMS/c/HRS_HRAM.HRS_APP_SCHJOB.GBL?Page=HRS_APP_JBPST&Action=U&FOCUS=Applicant&SiteId=1&JobOpeningId=${jobId}&PostingSeq=1`
      await page.goto(URL, { waitUntil : 'networkidle2' });
      const data = await scrapeJob(page);
      await page.waitFor(1000);
      console.log(data);
    }
  }
  process.exit();
}

run();
