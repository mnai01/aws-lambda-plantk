// Create clients and set shared const values outside of the handler.

// Get the DynamoDB table name from environment variables
const tableName = process.env.HOUSE_PLANTS_TABLE;

const AWS = require("aws-sdk");
const { initSecret } = require("../utils/getSecret");
const { isValidIP } = require("../utils/isValidIP");

const settings = {};

if (process.env.AWS_SAM_LOCAL) {
  settings.endpoint = "http://dynamodb-local:8000";
}

// Create a DocumentClient that represents the query to add an item
const docClient = new AWS.DynamoDB.DocumentClient(settings);

/**
 * A simple example includes a HTTP get method to get all items from a DynamoDB table.
 */
exports.getAllItemsHandler = async (event) => {
  // Verify RapidAPI IPs
  if (!isValidIP(event)) {
    throw new Error(`Not Valid IP`);
  }

  await initSecret;

  console.log(event["headers"]["X-Rapidapi-Proxy-Secret"]);
  console.log({ STORED_SECRET: process.env.STORED_SECRET });

  // Verify RapidAPI secret token
  if (
    process.env.STORED_SECRET !== event["headers"]["X-Rapidapi-Proxy-Secret"]
  ) {
    throw new Error(`Secret not match`);
  }

  if (event.httpMethod !== "GET") {
    throw new Error(
      `getAllItems only accept GET method, you tried: ${event.httpMethod}`
    );
  }
  // All log statements are written to CloudWatch
  console.info("received:", event);

  // get all items from the table (only first 1MB data, you can use `LastEvaluatedKey` to get the rest of data)
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#scan-property
  // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html

  let response = {};

  try {
    const params = {
      TableName: tableName,
    };
    const data = await docClient.scan(params).promise();
    const items = data.Items;

    response = {
      statusCode: 200,
      body: JSON.stringify(items),
    };
  } catch (ResourceNotFoundException) {
    response = {
      statusCode: 404,
      body: "Unable to call DynamoDB. Table resource not found.",
    };
  }

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
