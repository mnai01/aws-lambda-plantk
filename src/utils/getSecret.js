const AWS = require("aws-sdk");
const client = new AWS.SecretsManager({ region: process.env.AWS_REGION });

async function getSecret() {
  const secret = process.env["STORED_SECRET"];

  if (secret) {
    console.info("*** SECRET WAS IN THE CACHE");
    return secret;
  }

  try {
    const { SecretString } = await client.getSecretValue({ SecretId: process.env.RAPID_SECRET_ID }).promise();
    console.info("*** SECRET WAS FETCHED FROM SECRETS MANAGER");
    return JSON.parse(SecretString).secret;
  } catch (err) {
    console.info(err, "SECRET GET_SECRET_VALUE FAILED");
  }
}

async function initSecret() {
  const secret = await getSecret();
  process.env.STORED_SECRET = secret;
}

module.exports = { initSecret };
