const fs = require('fs-extra');
const getJobs = require('./get-jobs');
let agencyCodes = require('./util/agency-codes');

if (process.env.DEBUG) agencyCodes = agencyCodes.slice(0, 1);

let allAgencyJobIds = [];

const getAgencyJobIds = async () => {
  for (const agencyCode of agencyCodes) {
    console.log(`Fetching jobs for agency code ${agencyCode}`);
    try {
      const agencyJobIds = await getJobs(agencyCode);
      allAgencyJobIds.push(agencyJobIds);
    } catch(e) {
      console.log(`Oops, something went wrong getting jobIds for agency ${agencyCode}`, e);
    }
  }

  return allAgencyJobIds;
}

module.exports = getAgencyJobIds;
