const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = (data) => {
  let errors = {};

  if (!isEmpty(data.twitter) && !Validator.isURL(data.twitter))
    errors.twitter = "Not a valid URL";

  if (!isEmpty(data.facebook) && !Validator.isURL(data.facebook))
    errors.facebook = "Not a valid URL";

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
