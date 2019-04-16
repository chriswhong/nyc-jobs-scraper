const mongoose = require('mongoose');

// define Schema
module.exports = mongoose.Schema({
  'jobId': String,
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
  'postingDate': String,
  'content': String,
  'salaryLow': String,
  'salaryHigh': String,
  'salaryType': String,
  'agencyId': String,
  'jobCategoryIds': Array,
});
