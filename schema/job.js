const mongoose = require('mongoose');

// define Schema
module.exports = mongoose.Schema({
  'jobId': {
    type: 'String',
    unique: true,
  },
  'agency': String,
  'businessTitle': String,
  'civilServiceTitle': String,
  'titleClassification': String,
  'jobCategories': String,
  'careerLevel': String,
  'workLocation': String,
  'workUnit': String,
  'numberOfPositions': String,
  'titleCodeNumber': String,
  'level': String,
  'postingDate': Date,
  'content': String,
  'salaryLow': String,
  'salaryHigh': String,
  'salaryType': String,
  'agencyId': String,
  'jobCategoryIds': Array,
});
