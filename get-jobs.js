const puppeteer = require('puppeteer');
const cheerio = require('cheerio');


// parses a single job (a tr element) using cheerio
const parseJobHTML = (html) => {
  const $ = cheerio.load(html);

  // get job title and id line
  const titleId = $('a.PSHYPERLINK').text()
  const [ title, id ] = titleId.split('-').map(d => d.trim());

  // get job attributes line
  const jobAttributes = $('[id^=JOBATTRIBUTES]').text();
  let [ department, location, agency, postedDate ] = jobAttributes.split('|');

  // clean up job attributes
  department = department.split('Department: ')[1].trim();
  location = location.split('Location: ')[1].trim();
  agency = agency.split('Agency: ')[1].trim();
  postedDate = postedDate.split('Posted Date: ')[1].trim();

  return {
    title,
    id,
    department,
    location,
    agency,
    postedDate,
  }
};

// pass in a page from puppeteer, it will return an array of parsed job data
const scrapeJobs = async (page) => {
  const jobs = await page.evaluate(() => {
    const trs = Array.from(document.querySelectorAll('.PSLEVEL1GRIDNBO tr'));
    return trs.map(d => d.innerHTML);
  });

  return jobs.map(parseJobHTML);
};

const getJobs = async (agencyCode) => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  // We need two URLs because the first gets us a bunch of cookies that need to be in place
  // for the second to load properly.
  const URL1 = 'https://a127-jobs.nyc.gov/index.html';
  // This is the URL that gets loaded in an iFrame if you load URL1 above
  const URL2 = `https://a127-jobs.nyc.gov/psc/nycjobs/EMPLOYEE/HRMS/c/HRS_HRAM.HRS_APP_SCHJOB.GBL?FOCUS=Applicant&agency=${agencyCode}&`


  await page.goto(URL1, { waitUntil : 'networkidle2' });
  await page.goto(URL2, { waitUntil : 'networkidle2' });

  // scrape the jobs!
  let jobData = await scrapeJobs(page);

  // go to the next page
  // TODO check how many pages of results there are and iterate accordingly
  const hasNextPage = await page.evaluate(() => {
    let [ nextPage ] = document.getElementsByClassName('PTNEXTROW1');
    if (nextPage) {
      nextPage.click();
      return true;
    }
    return false;
  });

  if (hasNextPage) {
    await page.waitFor(500);

    const page2Jobs = await scrapeJobs(page)

    jobData = [...jobData, ...page2Jobs];
  }


  browser.close();

  return jobData;
}

module.exports = getJobs;
