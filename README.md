# nyc-jobs-proxy
Scrapes current NYC government jobs from a127-jobs.nyc.gov using puppeteer and cheerio, outputs to CSV

## How to Use
`npm install` to install dependencies, then run `npm start`.

## How it works

`npm start` kicks off the following process:

1 - Iterates over each agency page and pulls job ids.  These are saved in `tmp/agency-job-ids.json`.

2 - Iterates over each job id, appending csv rows to `tmp/{timestamp}.csv`

3 - PUTs the finished CSV to DigitalOcean Spaces (S3 Clone)

4 - Notifies Slack with info about the file (rows, filesize)

## Test Mode

Run `TEST=true npm start` to run the whole workflow using only jobs from the first agency in `utils/agency-codes`, loading data into the database specified in `MONGO_URI_TEST`;

## Environment Variables

Create a `.env` with the following when running locally:Â

- `AWS_ACCESS_KEY_ID` - S3/DO Spaces Access Key ID
- `AWS_SECRET_ACCESS_KEY` - S3/DO Spaces Secret Access Key
- `MONGO_URI` - Mongodb connection string
- `MONGO_URI_TEST` - Mongodb connection string for test mode
- `SLACK_WEBHOOK_URL` - Webhook URL for slack notifications
