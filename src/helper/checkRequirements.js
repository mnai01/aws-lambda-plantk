const { initSecret } = require("../utils/getSecret");
const { isValidIP } = require("../utils/isValidIP");

const checkRequirements = async (event) => {
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

    // false means no problems
    return false;
  } catch {
    return {
      statusCode: 500,
      body: "Internal Server error from manager",
    };
  }
};

module.exports = { checkRequirements };
