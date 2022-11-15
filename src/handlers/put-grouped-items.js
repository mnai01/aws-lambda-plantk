// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
const AWS = require("aws-sdk");
const { checkRequirements } = require("../helper/checkRequirements");
// Get the DynamoDB table name from environment variables
const tableName = process.env.HOUSE_PLANTS_TABLE;

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
exports.putGroupedItemsHandler = async (event) => {
  if (event.httpMethod !== "POST") {
    throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
  }
  try {
    // goes through security checks
    const errors = await checkRequirements(event);
    if (errors) {
      return errors;
    }
  } catch (err) {
    console.info(err);
    return {
      statusCode: 500,
      body: "Internal Server Error",
    };
  }

  // Creates a new item, or replaces an old item with a new item
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
  let response = {};
  const settings = {};

  if (process.env.AWS_SAM_LOCAL) {
    settings.endpoint = "http://dynamodb-local:8000";
  }

  // Create a DocumentClient that represents the query to add an item
  const docClient = new AWS.DynamoDB.DocumentClient(settings);

  // Get id and name from the body of the request
  const body = JSON.parse(event.body);

  try {
    let temp = [];
    await body.HousePlantsTable.forEach((record) => {
      temp.push(record);
      console.info({ temp, body }, temp.length === 25);
      // TODO If at last index push the remaining in the array
      if (temp.length === 25) {
        const params = { RequestItems: { [tableName]: temp } };
        console.info(params, "IN CONDITION");
        docClient.batchWrite(params, function (err, data) {
          if (err) console.info({ err, data }); // an error occurred
          else console.info({ SUCCESS: data }); // successful response
        });
        temp.length = 0;
      }
    });
    response = {
      statusCode: 200,
      body: "Success",
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
