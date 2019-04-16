# nyc-jobs-proxy
Scrapes current NYC government jobs from a127-jobs.nyc.gov using puppeteer and cheerio, outputs to CSV

It's just a node script that you can run locally.  `npm install` to install dependencies, then run `npm start`.

## Methodology

`npm start` kicks off the following process:

1 - Iterates over each agency page and pulls job ids.  These are saved in `tmp/agency-job-ids.json`.

2 - Iterates over each job id, appending csv rows to `tmp/{timestamp}.csv`

3 - PUTs the finished CSV to DigitalOcean Spaces (S3 Clone)

## Environment Variables

`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` must be set for the script to push a csv to S3/DOSpaces
