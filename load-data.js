const fetch = require('node-fetch');
const csv = require('csvtojson');
const moment = require('moment');
const mongoose = require('mongoose');
const slugify = require('slugify');

const jobSchema = require('./schema/job');
const agencyLookup = require('./util/agency-lookup');
const { processCategories } = require('./util/process-categories');

require('dotenv').config();

const timestamp = 1555383702964;

const dataURL = `https://nyc-jobs.sfo2.digitaloceanspaces.com/${timestamp}.csv`;
const dataUpdatedAt = moment(timestamp).format();

(async () => {
  const csvString = await fetch(dataURL)
    .then(d => d.text())
    .catch(err => console.error(err));

  const jsonArray= await csv().fromString(csvString);

  // add clean agency_id to each record
  const jobsWithAgencyData = jsonArray.map((job) => {
    const { agency, jobCategories } = job;

    const { displayName, acronym } = agencyLookup(agency);
    job.agencyId = slugify(displayName, { remove: /[*+~.()'"!:@,]/g }).toLowerCase();
    job.agency = displayName;
    if (acronym) job.agency_acronym = acronym;

    // convert job_categories to array
    // add clean category slug to each record
    if (jobCategories) {
      job.jobCategoryIds = processCategories(jobCategories);
    } else {
      job.jobCategoryIds = ['no-category'];
    }

    return job;
  });


  console.log(jobsWithAgencyData[0], dataUpdatedAt);
  
  // make a connection
  mongoose.connect(process.env.MONGO_URI);

  // get reference to database
  const db = mongoose.connection;

  db.on('error', console.error.bind(console, 'connection error:'));

  db.once('open', () => {
    console.log('Connection Successful!');

    // compile schema to model
    const Job = mongoose.model('Job', jobSchema, 'jobs');

    // delete everything in the collection
    Job.deleteMany({}, () => {
      console.log('Deleted all documents in Collection');

      // save multiple documents to the collection referenced by Job Model
      Job.collection.insertMany(jobsWithAgencyData, (err, docs) => {
        if (err) {
          return console.error(err);
        }
        console.log('Multiple documents inserted to Collection');
      });
    });

    const Meta = mongoose
      .model('Meta', mongoose.Schema({ dataUpdatedAt: String }), 'meta');

    Meta.deleteMany({}, () => {
      console.log('Deleted all documents in Collection');

      Meta.create({ dataUpdatedAt }, (err) => {
        if (err) return handleError(err);
        console.log('Saved Metadata!'); // eslint-disable-line
      });
    });
  });
})();
