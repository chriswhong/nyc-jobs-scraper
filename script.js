const getJobs = require('./get-jobs');

(async () => {
  const jobs = await getJobs('030');
  console.log(jobs, jobs.length);
})()
