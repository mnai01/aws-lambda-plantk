const { checkRequirements } = require("../helper/checkRequirements");

exports.authorizer = async (event) => {
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
};
