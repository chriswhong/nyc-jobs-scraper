const fs = require('fs-extra');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const { processCategories } = require('./util/process-categories');

// set up output csv
const timestamp = Date.now();
const outputPath = `tmp/${timestamp}.csv`;
fs.openSync(outputPath, 'w');
let firstWrite = true;

const writeToCSV = async (data) => {
  // if firstWrite, write the headers
  if (firstWrite) {
    fs.appendFileSync(outputPath, `${Object.keys(data).join(',')}\n`);
    firstWrite = false;
  }

  const csvRow = Object.keys(data)
    .map(key => {
      if ((key === 'jobCategories') || (key === 'content')) return `"${data[key].join(';')}"`
      return `"${data[key]}"`;
    })
    .join(',');

  fs.appendFileSync(outputPath, `${csvRow}\n`);
}

const parseContent = (content) => {
  const $ = cheerio.load(content);
  const headers = $('[id^=HRS_SCH_PSTDSC_DESCR\\$]').map(function() {
    return $(this).text();
  }).get()

  const bodies = $('[id^=HRS_SCH_PSTDSC_DESCRLONG\\$]').map(function() {
    return $(this).html();
  }).get()

  return headers.map((header, i) => {
    return `<h3>${header}</h3><p>${bodies[i]}</p>`;
  });
};

const scrapeJob = async (page) => {
  const data = await page.evaluate(() => {
    const idsToScrape = {
      jobId: 'NYC_DRVD_EHIRE_HRS_JOB_OPENING_ID',
      agency: 'HRS_BS_UNT_HR_I_DESCR',
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

const scrapeJobData = async (agencyJobIds) => {

  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  // give a little message about how much scraping we are about to do
  const count = agencyJobIds.reduce((acc, cur) => cur.jobIds.length + acc, 0);
  console.log(`Scraping ${count} jobs`);

  for (const agency of agencyJobIds) {
    for (const jobId of agency.jobIds) {
      console.log(`Fetching data for job ${jobId}...`)
      try {
        const URL = `https://a127-jobs.nyc.gov/psc/nycjobs/EMPLOYEE/HRMS/c/HRS_HRAM.HRS_APP_SCHJOB.GBL?Page=HRS_APP_JBPST&Action=U&FOCUS=Applicant&SiteId=1&JobOpeningId=${jobId}&PostingSeq=1`
        await page.goto(URL, { waitUntil : 'networkidle2' });
        const data = await scrapeJob(page);
        await page.waitFor(100);
        writeToCSV(data);
      } catch(e) {
        console.log(`Oops, something went wrong with job ${jobId}`, e)
      }
    }
  }

  return `tmp/${timestamp}.csv`;
}

module.exports = scrapeJobData;
