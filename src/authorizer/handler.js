const { initSecret } = require("../utils/getSecret");
const { isValidIP } = require("../utils/isValidIP");

exports.authorizer = async (event) => {
  console.info("Received event:", JSON.stringify(event, null, 2));
  const RAPID_SECRET_TOKEN_KEY = !process.env.AWS_SAM_LOCAL ? "X-RapidAPI-Proxy-Secret" : "X-Rapidapi-Proxy-Secret";
  const RAPID_USER = !process.env.AWS_SAM_LOCAL ? "X-RapidAPI-User" : "X-Rapidapi-User";

  // Retrieve request parameters from the Lambda function input:
  var headers = event.headers;

  // Parse the input for the parameter values
  var tmp = event.methodArn.split(":");
  var apiGatewayArnTmp = tmp[5].split("/");
  var resource =
    tmp[0] + ":" + tmp[1] + ":" + tmp[2] + ":" + tmp[3] + ":" + tmp[4] + ":" + apiGatewayArnTmp[0] + "/*/*";

  // if (apiGatewayArnTmp[3]) {
  //     resource += apiGatewayArnTmp[3];
  // }
  try {
    await initSecret();
  } catch (err) {
    throw new Error("INTERNAL SERVER");
  }

  // sets secret
  // checks for valid IPs
  // check for valid token
  // check if set secret and token from header match
  if (
    isValidIP(event) &&
    headers[RAPID_SECRET_TOKEN_KEY] &&
    process.env.STORED_SECRET === headers[RAPID_SECRET_TOKEN_KEY]
  ) {
    return generateAllow("user", resource);
  } else {
    throw new Error("Unauthorized");
  }
};

// Help function to generate an IAM policy
var generatePolicy = function (principalId, effect, resource) {
  // Required output:
  var authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    var policyDocument = {};
    policyDocument.Version = "2012-10-17"; // default version
    policyDocument.Statement = [];
    var statementOne = {};
    statementOne.Action = "execute-api:Invoke"; // default action
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};

var generateAllow = function (principalId, resource) {
  return generatePolicy(principalId, "Allow", resource);
};

var generateDeny = function (principalId, resource) {
  return generatePolicy(principalId, "Deny", resource);
};
