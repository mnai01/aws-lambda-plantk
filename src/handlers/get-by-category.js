// Create clients and set shared const values outside of the handler.
const AWS = require("aws-sdk");

// Get the DynamoDB table name from environment variables
const tableName = process.env.HOUSE_PLANTS_TABLE;

/**
 * A simple example includes a HTTP get method to get all items from a DynamoDB table.
 */
exports.getByCategoryHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(`getAllItems only accept GET method, you tried: ${event.httpMethod}`);
  }

  console.info("received:", event);

  let category = event.pathParameters.category.replace(/%20/g, " ").replace("%26", "&");

  console.info("Search Category by: " + category);

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
      ProjectionExpression: [
        "Img",
        "id",
        "#Family",
        "#Latin_name",
        "#Other_names",
        "#Common_name",
        "#Common_name_",
        "#Description",
        "#Categories",
        "#Origin",
        "#Climat",
        "#Zone",
      ],
      ExpressionAttributeNames: {
        "#Family": "Family",
        "#Latin_name": "Latin name",
        "#Other_names": "Other names",
        "#Common_name": "Common name",
        "#Common_name_": "Common name (fr.)",
        "#Description": "Description",
        "#Categories": "Categories",
        "#Origin": "Origin",
        "#Climat": "Climat",
        "#Zone": "Zone",
      },
      FilterExpression: "Categories = :Categories",
      ExpressionAttributeValues: {
        ":Categories": category,
      },
    };
    const data = await docClient.scan(params).promise();
    let items = data.Items;

    let res = [];

    items.forEach((item) => {
      if (item.Categories === category) {
        res.push(item);
      }
    });

    response = {
      statusCode: 200,
      body: JSON.stringify(res),
    };
  } catch (ResourceNotFoundException) {
    console.info(ResourceNotFoundException);
    response = {
      statusCode: 404,
      body: "Unable to call DynamoDB. Table resource not found.",
    };
  }

  // All log statements are written to CloudWatch
  console.info(`response from: ${event.path} statusCode: ${response.statusCode}`);
  return response;
};
