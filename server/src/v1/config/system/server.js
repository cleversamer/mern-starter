const PORT = process.env["PORT"] || 4000;

const DATABASE_NAME = "demo";

const DATABASE_URI =
  process.env["MONGODB_URI"] || `mongodb://127.0.0.1:27017/${DATABASE_NAME}`;

const MAX_FILE_UPLOAD_SIZE = 5; // In MegaBytes

const MAX_REQ_BODY_SIZE = 8; // In KiloBytes

const SUPPORTED_LANGUAGES = ["en", "ar"];

const MAX_REQUESTS = {
  PER_MILLISECONDS: 1 * 60 * 1000, //  => 1 minute
  NUMBER: 10, // allowed number of requests
};

const PASSWORD_SALT = process.env["PASSWORD_SALT"];

module.exports = {
  PORT,
  DATABASE_NAME,
  DATABASE_URI,
  MAX_FILE_UPLOAD_SIZE,
  MAX_REQUESTS,
  MAX_REQ_BODY_SIZE,
  SUPPORTED_LANGUAGES,
  PASSWORD_SALT,
};
