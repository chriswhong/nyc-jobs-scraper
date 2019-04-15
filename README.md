# nyc-jobs-proxy
Scrapes current NYC government jobs from a127-jobs.nyc.gov using puppeteer and cheerio

It's just a node script that you can run locally.  `npm install` to install dependencies, then run `npm script.js`.

I'd like to add express.js, and have the script save a static JSON file in the `/public` directory.  The script can be set to run once an hour or whatever and overwrite the JSON.

## Methodology

First, we need a complete list of all job id numbers.  `agencies.js` iterates over all agency codes and scrapes the job listings, exporting an array ids for each agency.  This takes about 7 minutes to crawl all 73 agency codes.

Next, we must scrape all jobs
