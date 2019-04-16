const getAgencyJobIds = require('./get-agency-job-ids');
const scrapeJobData = require('./scrape-job-data');
const pushToSpaces = require('./push-to-spaces');

require('dotenv').config();

(async () => {
  // get all job ids
  const agencyJobIds = await getAgencyJobIds();
  // scrape each job id
  const csvPath = await scrapeJobData(agencyJobIds);
  // push to DO Spaces
  await pushToSpaces(csvPath)
  process.exit()
})();
