// Create clients and set shared const values outside of the handler.
const AWS = require("aws-sdk");
const { initSecret } = require("../utils/getSecret");
const { isValidIP } = require("../utils/isValidIP");

// Get the DynamoDB table name from environment variables
const tableName = process.env.HOUSE_PLANTS_TABLE;

/**
 * A simple example includes a HTTP get method to get all items from a DynamoDB table.
 */
exports.getAllItemsHandler = async (event) => {
  // Alot of Request testing programs lowercase the header name so this is needed for local development
  const RAPID_SECRET_TOKEN_KEY = !process.env.AWS_SAM_LOCAL ? "X-RapidAPI-Proxy-Secret" : "X-Rapidapi-Proxy-Secret";

  // Verify RapidAPI IPs
  if (!isValidIP(event)) {
    // throw new Error(`Not Valid IP`);
    return {
      statusCode: 401,
      body: "Unauthorized IP Address",
    };
  }

  try {
    await initSecret();

    console.info(event["headers"]);

    // Verify RapidAPI secret token
    if (!event["headers"][RAPID_SECRET_TOKEN_KEY]) {
      // throw new Error(`Secret not match`);
      return {
        statusCode: 401,
        body: "Unauthorized User 100",
      };
    }

    if (process.env.STORED_SECRET !== event["headers"][RAPID_SECRET_TOKEN_KEY]) {
      return {
        statusCode: 401,
        body: "Unauthorized User 101",
      };
    }
  } catch {
    return {
      statusCode: 500,
      body: "Internal Server error from manager",
    };
  }

  if (event.httpMethod !== "GET") {
    throw new Error(`getAllItems only accept GET method, you tried: ${event.httpMethod}`);
  }

  // get all items from the table (only first 1MB data, you can use `LastEvaluatedKey` to get the rest of data)
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#scan-property
  // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html

  let response = {};
  const settings = {};

  if (process.env.AWS_SAM_LOCAL) {
    settings.endpoint = "http://dynamodb-local:8000";
  }

  // Create a DocumentClient that represents the query to add an item
  const docClient = new AWS.DynamoDB.DocumentClient(settings);

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
  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
};
