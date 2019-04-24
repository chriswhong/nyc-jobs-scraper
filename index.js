const { IncomingWebhook } = require('@slack/webhook');

const getAgencyJobIds = require('./src/get-agency-job-ids');
const scrapeJobData = require('./src/scrape-job-data');
const pushToSpaces = require('./src/push-to-spaces');
const loadData = require('./src/load-data');
const getCSVMetrics = require('./src/get-csv-metrics');

const slack = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

require('dotenv').config();

(async () => {
  try {
    await slack.send('Starting nyc civic jobs ETL');

    // get all job ids
    const agencyJobIds = await getAgencyJobIds();

    // scrape each job id
    const csvPath = await scrapeJobData(agencyJobIds);

    // push to DO Spaces
    await pushToSpaces(csvPath);

    // load to mongodb
    await loadData(csvPath);

    // notify slack
    const { rows, size } = await getCSVMetrics(csvPath);
    await slack.send(`The nycjobs ETL was successful! Wrote ${rows} rows (${size})`);
  } catch (e) {
    console.log(e);
    slack.send(`Something went wrong with the nycjobs ETL: ${e}`);
  }
  process.exit();
})();
