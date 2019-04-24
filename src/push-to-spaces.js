const fs = require('fs');
const AWS = require('aws-sdk');
const util = require('util');

const readFile = fileName => util.promisify(fs.readFile)(fileName, 'utf8');

const pushToSpaces = async (filePath) => {
  console.log(`Pushing ${filePath} to DO Spaces`);
  const endpoint = new AWS.Endpoint('sfo2.digitaloceanspaces.com');
  const s3 = new AWS.S3({ endpoint });

  const data = await readFile(filePath);

  try {
    const result = await s3.putObject({
      ACL: 'public-read',
      Body: data,
      Bucket: 'nyc-jobs',
      Key: filePath.split('/')[1],
      ContentType: 'text/csv',
    }).promise();
    console.log(result);
  } catch (e) {
    console.log(e);
  }
};

module.exports = pushToSpaces;
