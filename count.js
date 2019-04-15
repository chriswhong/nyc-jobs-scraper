const { allAgencyJobIds } = require('./tmp/agency-job-ids.json');

const count = allAgencyJobIds.reduce((acc, cur) => {
  return cur.jobIds.length + acc;
}, 0);

console.log(count);
