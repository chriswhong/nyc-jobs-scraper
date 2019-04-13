const getJobs = require('./get-jobs');

(async () => {
  const jobs = await getJobs('996');
  console.log(jobs, jobs.length);
})()
