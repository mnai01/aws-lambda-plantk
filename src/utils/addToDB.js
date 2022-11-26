const AWS = require("aws-sdk");
const data = require("../../sample_batchWriteDocClient.json");

const putItemHandler = async () => {
  AWS.config.update({ region: "us-east-2" });

  // Create a DocumentClient that represents the query to add an item
  const docClient = new AWS.DynamoDB.DocumentClient();

  try {
    let temp = [];
    await data.HousePlantsTable.forEach((record, index) => {
      temp.push(record);
      // TODO If at last index push the remaining in the array
      if (temp.length === 25) {
        const params = { RequestItems: { ["sam-pipelines-prod-HousePlantsTable-1T35AWB2G9NRP"]: temp } };
        docClient.batchWrite(params, function (err, data) {
          if (err) console.info({ err, data }); // an error occurred
          else console.info({ SUCCESS: data }); // successful response
        });
        temp.length = 0;
      }
      // final push
      if (data.HousePlantsTable.length === index + 1) {
        const params = { RequestItems: { ["sam-pipelines-prod-HousePlantsTable-1T35AWB2G9NRP"]: temp } };
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
    console.log(ResourceNotFoundException);
  }

  return response;
};

putItemHandler();
