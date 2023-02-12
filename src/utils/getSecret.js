const AWS = require("aws-sdk");
const ssm = new AWS.SSM();

async function getSecret() {
  const param = process.env["STORED_PARAM"];

  if (param) {
    console.info("*** PARAM WAS IN THE CACHE");
    return param;
  }

  try {
    const result = await ssm
      .getParameter({
        Name: process.env.RAPID_PARAM_ID,
        WithDecryption: true,
      })
      .promise();

    console.info("*** SECRET WAS FETCHED FROM PARAMETER STORE");
    return result.Parameter.Value;
  } catch (err) {
    console.info(err, "SECRET GET PARAMETER FAILED");
  }
}

async function initSecret() {
  const param = await getSecret();
  process.env.STORED_PARAM = param;
}

module.exports = { initSecret };
