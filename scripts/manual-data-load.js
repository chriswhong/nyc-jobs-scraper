// loads a single csv into the database

const loadData = require('../src/load-data');

const csvPath = process.argv[2];

loadData(csvPath);
