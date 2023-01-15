const admin = require("firebase-admin");
const { ApiError } = require("../../middleware/apiError");
const httpStatus = require("http-status");
const errors = require("../../config/errors");
const serviceAccount = require("../../config/system/firebase-app-key.json");

// Initialize firebase authentication
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const decodeToken = async (token) => {
  try {
    // Get google user's data via google token
    const decodeValue = await admin.auth().verifyIdToken(token);

    // Check if decoded value is invalid (Google token)
    if (!decodeValue) {
      const statusCode = httpStatus.FORBIDDEN;
      const message = errors.auth.invalidGoogleToken;
      throw new ApiError(statusCode, message);
    }

    return decodeValue;
  } catch (err) {
    const statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    const message = errors.auth.googleAuthError;
    throw new ApiError(statusCode, message);
  }
};

module.exports = {
  admin,
  decodeToken,
};
