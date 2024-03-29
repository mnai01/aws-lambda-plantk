// Create clients and set shared const values outside of the handler.
const AWS = require("aws-sdk");
const Fuse = require("fuse.js");

// Get the DynamoDB table name from environment variables
const tableName = process.env.HOUSE_PLANTS_TABLE;

/**
 * A simple example includes a HTTP get method to get all items from a DynamoDB table.
 */
exports.postAllSearchedItemsHandler = async (event) => {
  console.info("received:", event);

  if (event.httpMethod !== "POST") {
    throw new Error(`getAllItems only accept POST method, you tried: ${event.httpMethod}`);
  }

  // get all items from the table (only first 1MB data, you can use `LastEvaluatedKey` to get the rest of data)
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#scan-property
  // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html

  // Get id and name from the body of the request
  const body = JSON.parse(event.body);
  const query = body.query;

  if (!query || typeof query !== "string") {
    return {
      statusCode: 200,
      body: "Please enter a valid string for the search query term",
    };
  }

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

    console.info(items);

    const options = {
      includeScore: false,
      keys: [
        "Latin name",
        "Family",
        "Other names",
        "Common name",
        "Common name (fr.)",
        "Description",
        "Categories",
        "Origin",
      ],
    };

    const fuse = new Fuse(items, options);
    const result = fuse.search(query);

    console.log(result);

    response = {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (ResourceNotFoundException) {
    console.info({ ResourceNotFoundException });
    response = {
      statusCode: 404,
      body: "Unable to call DynamoDB. Table resource not found.",
    };
  }

  // All log statements are written to CloudWatch
  console.info(`response from: ${event.path} statusCode: ${response.statusCode}`);
  return response;
};
