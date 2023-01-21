// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
const AWS = require("aws-sdk");

// Get the DynamoDB table name from environment variables
const tableName = process.env.HOUSE_PLANTS_TABLE;

/**
 * A simple example includes a HTTP get method to get one item by id from a DynamoDB table.
 */
exports.getByIdHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
  }

  // Get id from pathParameters from APIGateway because of `/{id}` at template.json
  const id = event.pathParameters.id;

  // Get the item from the table
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#get-property
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
      Key: { id: id },
    };
    console.info(params);
    const data = await docClient.get(params).promise();
    const item = data.Item;
    response = {
      statusCode: 200,
      body: JSON.stringify(item),
    };
  } catch (ResourceNotFoundException) {
    console.info(ResourceNotFoundException);
    response = {
      statusCode: 404,
      body: "Unable to call DynamoDB. Table resource not found.",
    };
  }

  // All log statements are written to CloudWatch
  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
};
