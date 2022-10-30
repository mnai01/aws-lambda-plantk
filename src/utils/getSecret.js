const AWS = require("aws-sdk");
const client = new AWS.SecretsManager({ region: "us-east-2" });

async function getSecret() {
  const secret = process.env["STORED_SECRET"];

  if (secret) {
    console.log("*** SECRET WAS IN THE CACHE");
    return secret;
  }

  const { SecretString } = await client
    .getSecretValue({ SecretId: "RapidSecretkey" })
    .promise();
  console.log("*** SECRET WAS FETCHED FROM SECRETS MANAGER");
  return SecretString;
}

async function initSecret() {
  const secret = await getSecret();
  process.env.STORED_SECRET = secret;
}

module.exports = { initSecret };
