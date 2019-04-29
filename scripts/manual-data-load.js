// loads a single csv into the database
require('dotenv').config()

const loadData = require('../src/load-data');

const csvPath = process.argv[2];

loadData(csvPath);
