// Create clients and set shared const values outside of the handler.

// Get the DynamoDB table name from environment variables
const tableName = process.env.HOUSE_PLANTS_TABLE;

// Create a DocumentClient that represents the query to add an item
const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new dynamodb.DocumentClient();
const { checkRequirements } = require("../helper/checkRequirements");

/**
 * A simple example includes a HTTP get method to get one item by id from a DynamoDB table.
 */
exports.getByIdHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
  }
  try {
    // goes through security checks
    const errors = await checkRequirements(event);
    if (errors) {
      return errors;
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: "Internal Server Error",
    };
  }

  // All log statements are written to CloudWatch
  console.info("received:", event);

  // Get id from pathParameters from APIGateway because of `/{id}` at template.json
  const id = event.pathParameters.id;

  // Get the item from the table
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#get-property
  let response = {};

  try {
    const params = {
      TableName: tableName,
      Key: { id: id },
    };
    const data = await docClient.get(params).promise();
    const item = data.Item;

    response = {
      statusCode: 200,
      body: JSON.stringify(item),
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
