const httpStatus = require("http-status");
const _ = require("lodash");
const { clientSchema } = require("../../models/user/user.model");
const { usersService } = require("../../services");
const success = require("../../config/success");
const errors = require("../../config/errors");

module.exports.isAuth = async (req, res, next) => {
  try {
    const user = req.user;
    const { deviceToken } = req.query;

    // Update user's last login date
    user.updateLastLogin();

    // Update user's device token
    user.deviceToken = deviceToken || user.deviceToken;

    // Save user to the DB
    await user.save();

    // Create the response object
    const response = _.pick(user, clientSchema);

    // Send response back to the client
    res.status(httpStatus.OK).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.verifyEmailOrPhone = (key) => async (req, res, next) => {
  try {
    const user = req.user;
    const { code } = req.body;

    // Asking service to verify user's email or phone
    const verifiedUser = await usersService.verifyEmailOrPhone(key, user, code);

    // Create the response object
    const response = _.pick(verifiedUser, clientSchema);

    // Send response back to the client
    res.status(httpStatus.OK).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.resendEmailOrPhoneVerificationCode =
  (key) => async (req, res, next) => {
    try {
      const user = req.user;
      const { lang } = req.query;

      // Asking service to send user's email/phone verification code
      await usersService.resendEmailOrPhoneVerificationCode(key, user, lang);

      // Create the response object
      const response = {
        ok: true,
        message: success.auth[`${key}VerificationCodeSent`],
      };

      // Send response back to the client
      res.status(httpStatus.OK).json(response);
    } catch (err) {
      next(err);
    }
  };

module.exports.changePassword = async (req, res, next) => {
  try {
    const user = req.user;
    const { oldPassword, newPassword } = req.body;

    // Asking service to change user's password
    await usersService.changePassword(user, oldPassword, newPassword);

    // Create the response object
    const response = {
      user: _.pick(user, clientSchema),
      token: user.genAuthToken(),
    };

    // Send response back to the client
    res.status(httpStatus.CREATED).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.sendForgotPasswordCode = async (req, res, next) => {
  try {
    let { emailOrPhone, sendTo, lang } = req.query;

    // Filter the `emailOrPhone` query paramerer
    //
    // HINT:
    // This filter exists because when sending a phone number
    // the `+` character gets replaced into an empty character.
    if (emailOrPhone.startsWith(" ")) {
      emailOrPhone = `+${emailOrPhone.trim()}`;
    }

    // Asking service to send forgot password code to user's email/phone
    await usersService.sendResetPasswordCode(emailOrPhone, sendTo, lang);

    // Create the response object
    const response = {
      ok: true,
      message:
        sendTo === "phone"
          ? success.auth.passwordResetCodeSentToPhone
          : success.auth.passwordResetCodeSentToEmail,
    };

    // Send response back to the client
    res.status(httpStatus.OK).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.handleForgotPassword = async (req, res, next) => {
  try {
    const { emailOrPhone, code, newPassword } = req.body;

    // Asking service to reset user's password using the forgot
    // password code that the user has received it
    const user = await usersService.resetPasswordWithCode(
      emailOrPhone,
      code,
      newPassword
    );

    // Create the response object
    const response = _.pick(user, clientSchema);

    // Send response back to the client
    res.status(httpStatus.OK).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.updateProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const { name, email, phone, lang } = req.body;
    const avatar = req?.files?.avatar;

    // Asking service to update user's profile data
    const info = await usersService.updateProfile(
      lang,
      user,
      name,
      email,
      phone,
      avatar
    );

    // Create the response object
    const response = {
      user: _.pick(info.newUser, clientSchema),
      changes: info.changes,
      token: info.newUser.genAuthToken(),
    };

    // Send response back to the client
    res.status(httpStatus.CREATED).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.sendNotification = async (req, res, next) => {
  try {
    const { userIds = [], title = "", body = "", data = {} } = req.body;

    // Create a callback function to use it when sending notification
    // to a user's phone
    const callback = (err, res) => {
      // Check if the operation was declined or something happened
      if (err) {
        const statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        const message = errors.system.notification;
        const err = new ApiError(statusCode, message);
        return next(err);
      }

      // Create the response object
      const response = success.auth.notificationSent;

      // Send response back to the client
      res.status(httpStatus.OK).json(response);
    };

    // Asking service to send notification to a user's phone
    await usersService.sendNotification(userIds, title, body, data, callback);
  } catch (err) {
    next(err);
  }
};

module.exports.seeNotifications = async (req, res, next) => {
  try {
    const user = req.user;

    // Asking service to mark all user's notifications as seen
    const notifications = await usersService.seeNotifications(user);

    // Create the response object
    const response = {
      notifications,
    };

    // Send response back to the client
    res.status(httpStatus.OK).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.clearNotifications = async (req, res, next) => {
  try {
    const user = req.user;

    // Asking service to delete all user's notifications
    const notifications = await usersService.clearNotifications(user);

    // Create the response object
    const response = {
      notifications,
    };

    // Send response back to the client
    res.status(httpStatus.OK).json(response);
  } catch (err) {
    next(err);
  }
};

///////////////////////////// ADMIN /////////////////////////////
module.exports.updateUserProfile = async (req, res, next) => {
  try {
    const { lang = "ar", emailOrPhone, name, email, phone } = req.body;
    const avatar = req?.files?.avatar || null;

    // Asking service to updare user's profile data
    const info = await usersService.updateUserProfile(
      lang,
      emailOrPhone,
      name,
      email,
      phone,
      avatar
    );

    // Create the response object
    const response = {
      user: _.pick(info.newUser, clientSchema),
      changes: info.changes,
      token: info.newUser.genAuthToken(),
    };

    // Send response back to the client
    res.status(httpStatus.CREATED).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.verifyUser = async (req, res, next) => {
  try {
    const { emailOrPhone } = req.body;

    // Asking service to verify user's email and phone
    const updatedUser = await usersService.verifyUser(emailOrPhone);

    // Create the response object
    const response = _.pick(updatedUser, clientSchema);

    // Send response back to the client
    res.status(httpStatus.CREATED).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.changeUserRole = async (req, res, next) => {
  try {
    const { emailOrPhone, role } = req.body;

    // Asking service to update user's role
    const updatedUser = await usersService.changeUserRole(emailOrPhone, role);

    // Create the response object
    const response = _.pick(updatedUser, clientSchema);

    // Send response back to the client
    res.status(httpStatus.CREATED).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.findUserByEmailOrPhone = async (req, res, next) => {
  try {
    const { role, emailOrPhone } = req.query;

    // Asking service to find a user by its email or phone
    // with a specific role
    const user = await usersService.findUserByEmailOrPhone(
      emailOrPhone,
      role,
      true
    );

    // Create the response object
    const response = _.pick(user, clientSchema);

    // Send response back to the client
    res.status(httpStatus.OK).json(response);
  } catch (err) {
    next(err);
  }
};
