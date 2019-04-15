const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const { allAgencyJobIds } = require('./tmp/partial.json');
const { processCategories } = require('./util/process-categories');

const parseContent = (content) => {
  const $ = cheerio.load(content);
  const headers = $('[id^=HRS_SCH_PSTDSC_DESCR\\$]').map(function() {
    return $(this).text();
  }).get()

  const bodies = $('[id^=HRS_SCH_PSTDSC_DESCRLONG\\$]').map(function() {
    return $(this).html();
  }).get()

  return headers.map((header, i) => {
    return {
      header,
      content: bodies[i],
    }
  });
};

const scrapeJob = async (page) => {
  const data = await page.evaluate(() => {
    const idsToScrape = {
      jobId: 'NYC_DRVD_EHIRE_HRS_JOB_OPENING_ID',
      businessTitle: 'HRS_SCH_WRK2_POSTING_TITLE',
      civilServiceTitle: 'NYC_JOBCODE_TBL_DESCR',
      titleClassification: 'NYC_DRVD_EHIRE_DESCR100',
      jobCategories: 'win0divNYC_DRVD_EHIRE_DESCR254A',
      careerLevel: 'win0divNYC_DRVD_EHIRE_DESCR254C',
      workLocation: 'win0divHRS_LOCATION_I_DESCR',
      workUnit: 'HRS_DEPT_I_DESCR',
      numberOfPositions: 'NYC_DRVD_EHIRE_OPENINGS_TARGET',
      titleCodeNumber: 'win0divNYC_DRVD_EHIRE_NYC_TITLE',
      level: 'NYC_DRVD_EHIRE_NYC_TITLE_ASG_LV',
      proposedSalaryRange: 'NYC_DRVD_EHIRE_DESCR50',
      postingDate: 'NYC_DRVD_EHIRE_HRS_JO_PST_OPN_DT',
    }

    const jobData = {};
    Object.keys(idsToScrape).forEach((key) => {
      jobData[key] = document.getElementById(idsToScrape[key]).innerText;
    });

    jobData.content = document.getElementById('ACE_HRS_SCH_PSTDSC$0').innerHTML;

    return jobData;
  });

  // special handling for jobCategories
  data.jobCategories = processCategories(data.jobCategories);

  // special handling for proposedSalaryRange
  const [low, high] = data.proposedSalaryRange
    .match(/(^.*)\(/)[1]
    .split('-')
    .map((d) => d.split('$')[1].trim());

  const salaryData = {
    salaryLow: low,
    salaryHigh: high,
    salaryType: data.proposedSalaryRange.match(/\((\w+)\)/)[1],
  }

  // parse content
  data.content = parseContent(data.content);

  delete data.proposedSalaryRange;

  return {
    ...data,
    ...salaryData,
  };
}

const run = async () => {
  const browser = await puppeteer.launch({
    headless: true,
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
