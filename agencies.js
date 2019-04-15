const fs = require('fs-extra');
const getJobs = require('./get-jobs');

const agencyCodes = [
  '008',
  '125',
  '073',
  '341',
  '350',
  '351',
  '352',
  '342',
  '343',
  '344',
  '345',
  '346',
  '347',
  '348',
  '349',
  '010',
  '013',
  '942',
  '810',
  '831',
  '067',
  '030',
  '868',
  '134',
  '054',
  '313',
  '015',
  '312',
  '866',
  '072',
  '126',
  '903',
  '905',
  '850',
  '017',
  '826',
  '133',
  '836',
  '127',
  '057',
  '816',
  '071',
  '996',
  '806',
  '069',
  '226',
  '858',
  '032',
  '214',
  '136',
  '025',
  '019',
  '082',
  '009',
  '257',
  '056',
  '846',
  '131',
  '256',
  '781',
  '941',
  '210',
  '860',
  '827',
  '801',
  '021',
  '156',
  '041',
  '841',
  '820',
  '063',
  '185',
  '261',
];

const saveToFile = (json) => {
  const outputPath = './tmp/agency-job-ids.json'
  fs.ensureFileSync(outputPath);
  fs.writeFileSync(outputPath, JSON.stringify(json, null, 2));
}

let allAgencyJobIds = [];

const getAgencyData = async () => {
  for (const agencyCode of agencyCodes) {
    console.log(`Fetching jobs for ${agencyCode}`);
    try {
      const agencyJobIds = await getJobs(agencyCode);
      allAgencyJobIds.push(agencyJobIds);
    } catch(e) {
      console.log(`Oops, something went wrong getting jobIds for agency ${agencyCode}`, e);
    }
  }

  saveToFile({
    timestamp: new Date().toISOString(),
    allAgencyJobIds,
  });
  process.exit();
}

getAgencyData();
