const AWS = require("aws-sdk");
const client = new AWS.SecretsManager({ region: process.env.AWS_REGION });

async function getSecret() {
  const secret = process.env["STORED_SECRET"];

  if (secret) {
    console.info("*** SECRET WAS IN THE CACHE");
    return secret;
  }

  const { SecretString } = await client.getSecretValue({ SecretId: "RapidSecretkey-xJVhDdanqHdU" }).promise();
  console.info("*** SECRET WAS FETCHED FROM SECRETS MANAGER");

  return JSON.parse(SecretString).secret;
}

async function initSecret() {
  const secret = await getSecret();
  process.env.STORED_SECRET = secret;
}

module.exports = { initSecret };
