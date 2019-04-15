const puppeteer = require('puppeteer');
const cheerio = require('cheerio');


// parses a single job (a tr element) using cheerio
const parseJobHTML = (html) => {
  const $ = cheerio.load(html);

  // get job title and id line
  const titleId = $('a.PSHYPERLINK').text()
  const [ title, id ] = titleId.split(/-\s(\d{6})/).map(d => d.trim());

  // get job attributes line
  const jobAttributes = $('[id^=JOBATTRIBUTES]').text();
  let [ department, location, agency, postedDate ] = jobAttributes.split('|');

  // clean up job attributes
  department = department.split('Department: ')[1].trim();
  location = location.split('Location: ')[1].trim();
  agency = agency.split('Agency: ')[1].trim();
  postedDate = postedDate.split('Posted Date: ')[1].trim();

  return id;
};

// scrapes the page, returns an object with scraped data and
// a boolean indicating whether there is another page of info
const processPage = async (page) => {
  const jobsHTMLArray = await page.evaluate(() => {
    const trs = Array.from(document.querySelectorAll('.PSLEVEL1GRIDNBO tr'));
    return trs.map(d => d.innerHTML);
  });

  const hasNextPage = await page.evaluate(() => {
    const [ nextPage ] = document.getElementsByClassName('PTNEXTROW1');
    return !!nextPage;
  });

  const data = jobsHTMLArray.map(parseJobHTML);

  return {
    data,
    hasNextPage,
  };
}

// recursive function, concatenates several pages of scraped data into one array
const scrapeJobs = async (page) => {
  const { data, hasNextPage } = await processPage(page);

  if (hasNextPage) {
    // click the next button
    await page.evaluate(() => {
      document.getElementsByClassName('PTNEXTROW1')[0].click();
    });
    await page.waitFor(500);

    const nextPageData = await scrapeJobs(page);
    return [...data, ...nextPageData];
  } else {
    return data;
  }
};

// returns an object with agencyCode, agencyName, and an array of jobIds
const getJobs = async (agencyCode) => {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  // We need two URLs because the first gets us a bunch of cookies that need to be in place
  // for the second to load properly.
  const URL1 = 'https://a127-jobs.nyc.gov/index.html';
  // This is the URL that gets loaded in an iFrame if you load URL1 above
  const URL2 = `https://a127-jobs.nyc.gov/psc/nycjobs/EMPLOYEE/HRMS/c/HRS_HRAM.HRS_APP_SCHJOB.GBL?FOCUS=Applicant&agency=${agencyCode}&`


  await page.goto(URL1, { waitUntil : 'networkidle2' });
  await page.goto(URL2, { waitUntil : 'networkidle2' });

  let jobIds = await scrapeJobs(page);
  console.log(jobIds);

  return {
    agencyCode,
    jobIds,
  };
}

module.exports = getJobs;
