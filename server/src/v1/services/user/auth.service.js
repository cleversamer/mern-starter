const { User } = require("../../models/user/user.model");
const { ApiError } = require("../../middleware/apiError");
const httpStatus = require("http-status");
const errors = require("../../config/errors");
const usersService = require("./users.service");
const googleService = require("../messaging/google.service");

module.exports.register = async (
  email,
  password,
  name,
  phone,
  role,
  deviceToken,
  authType,
  googleToken
) => {
  try {
    if (authType === "email") {
      return await registerWithEmailOrPhone(
        name,
        email,
        phone,
        password,
        role,
        deviceToken
      );
    } else {
      return await registerWithGoogle(googleToken, phone, role);
    }
  } catch (err) {
    throw err;
  }
};

module.exports.login = async (emailOrPhone, password, deviceToken) => {
  try {
    // Asking service to find a user by their email or phone
    const user = await usersService.findUserByEmailOrPhone(emailOrPhone);

    // Check if user exist
    if (!user) {
      const statusCode = httpStatus.FORBIDDEN;
      const message = errors.auth.incorrectCredentials;
      throw new ApiError(statusCode, message);
    }

    // Decoding user's password and comparing it with the password argument
    const isCorrectPassword = await user.comparePassword(password);
    if (!isCorrectPassword) {
      const statusCode = httpStatus.FORBIDDEN;
      const message = errors.auth.incorrectCredentials;
      throw new ApiError(statusCode, message);
    }

    // Update user's last login date
    user.updateLastLogin();

    // Update user's device token
    user.deviceToken = deviceToken || user.deviceToken;

    // Save user to the DB
    await user.save();

    return user;
  } catch (err) {
    throw err;
  }
};

const registerWithEmailOrPhone = async (
  name,
  email,
  phone,
  password,
  role,
  deviceToken
) => {
  try {
    // Creating user instance
    const user = new User({
      name,
      email,
      phone: {
        full: `${phone.icc}${phone.nsn}`,
        icc: phone.icc,
        nsn: phone.nsn,
      },
      role,
      deviceToken: deviceToken || "",
    });

    // Set user's password
    await user.updatePassword(password);

    // Set a verification code for user's email
    user.updateCode("email");

    // Set a verification code for user's phone
    user.updateCode("phone");

    // Save user to the DB
    await user.save();

    return user;
  } catch (err) {
    if (err.code === errors.codes.duplicateIndexKey) {
      const statusCode = httpStatus.FORBIDDEN;
      const message = errors.auth.emailOrPhoneUsed;
      err = new ApiError(statusCode, message);
    }

    throw err;
  }
};

const registerWithGoogle = async (googleToken, phone, role) => {
  try {
    // Get the user data via google token
    const googleUser = await googleService.decodeToken(googleToken);

    // Check if there is a user registered with the specified email
    const registeredUser = await usersService.findUserByEmailOrPhone(
      googleUser.email
    );

    // Return the registered user if exists
    if (registeredUser) {
      return registeredUser;
    }

    // Create an instance of the User model
    const newUser = new User({
      email: googleUser.email,
      name: googleUser.name,
      phone,
      verified: {
        email: true,
        phone: false,
      },
      authType: "google",
      role,
    });

    // Save the user to the DB
    await newUser.save();

    return newUser;
  } catch (err) {
    throw err;
  }
};
