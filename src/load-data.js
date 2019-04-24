const fetch = require('node-fetch');
const csv = require('csvtojson');
const moment = require('moment');
const mongoose = require('mongoose');
const slugify = require('slugify');
const fs = require('fs');
const util = require('util');

// Convert fs.readFile into Promise version of same
const readFile = util.promisify(fs.readFile);

const jobSchema = require('../schema/job');
const agencyLookup = require('../util/agency-lookup');
const { processCategories } = require('../util/process-categories');

require('dotenv').config();

const loadData = async (csvPath) => {
  const timestamp = parseInt(csvPath.match(/[0-9]{13}/)[0], 10);
  const dataUpdatedAt = moment(timestamp).format();

  const csvString = await readFile(csvPath, 'utf8');
  const jsonArray = await csv().fromString(csvString);

  // add clean agencyId to each record
  const jobsWithAgencyData = jsonArray.map((job) => {
    console.log(job);
    const { agency, jobCategories } = job;
    const newJob = job;

    const { displayName, acronym } = agencyLookup(agency);
    newJob.agencyId = slugify(displayName, { remove: /[*+~.()'"!:@,]/g }).toLowerCase();
    newJob.agency = displayName;
    if (acronym) newJob.agency_acronym = acronym;

    // turn the dates into ISO dates
    newJob.postingDate = moment(job.postingDate, 'MM/DD/YYYY').format();

    // convert job_categories to array
    // add clean category slug to each record
    if (jobCategories) {
      newJob.jobCategoryIds = processCategories(jobCategories);
    } else {
      newJob.jobCategoryIds = ['no-category'];
    }

    return newJob;
  });

  const MONGO_URI = process.env.TEST ? process.env.MONGO_URI_TEST : process.env.MONGO_URI;

  // make a connection
  mongoose.connect(MONGO_URI, { useNewUrlParser: true });

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
      Job.collection.insertMany(jobsWithAgencyData, { ordered: false }, (err) => {
        if (err) {
          return console.error(err);
        }
        console.log('Multiple documents inserted to Collection');

        return null;
      });
    });

    const Meta = mongoose
      .model('Meta', mongoose.Schema({ dataUpdatedAt: String }), 'meta');

    Meta.deleteMany({}, () => {
      console.log('Deleted all documents in Collection');

      Meta.create({ dataUpdatedAt }, () => {
        console.log('Saved Metadata!'); // eslint-disable-line
      });
    });
  });
};

module.exports = loadData;
