const util = require('util');
const prettyBytes = require('pretty-bytes');
const exec = util.promisify(require('child_process').exec);

const getCSVMetrics = async (path) => {
  const wc = await exec(`wc -l -c ${path}`);
  const [rows, bytes] = wc.stdout.trim().split(/\s+/);

  return {
    rows,
    size: prettyBytes(parseInt(bytes, 10)),
  };
};

module.exports = getCSVMetrics;
