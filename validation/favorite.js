const Validator = require("validator");
const isEmpty = require("./isEmpty");

module.exports = (data) => {
  let errors = {};

  data.manga_id = isEmpty(data.manga_id) ? "" : data.manga_id;
  data.alias = isEmpty(data.alias) ? "" : data.alias;
  data.image_uri = isEmpty(data.image_uri) ? "" : data.image_uri;
  data.title = isEmpty(data.title) ? "" : data.title;
  data.time_ms = isEmpty(data.time_ms) ? "" : data.time_ms;

  if (Validator.isEmpty(data.manga_id))
    errors.manga_id = "Manga ID is required";

  if (Validator.isEmpty(data.alias))
    errors.alias = "Alias field can not be empty";

  if (Validator.isEmpty(data.image_uri))
    errors.image_uri = "Image field can not be empty";

  if (Validator.isEmpty(data.title))
    errors.title = "Title field can not be empty";

  if (Validator.isEmpty(data.time_ms))
    errors.time_ms = "Time added field can not be empty";

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
