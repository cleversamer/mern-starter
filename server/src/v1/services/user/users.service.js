const { User } = require("../../models/user/user.model");
const jwt = require("jsonwebtoken");
const httpStatus = require("http-status");
const emailService = require("../messaging/email.service");
const notificationsService = require("../messaging/notifications.service");
const localStorage = require("../storage/localStorage.service");
const { ApiError } = require("../../middleware/apiError");
const errors = require("../../config/errors");

module.exports.findUserByEmailOrPhone = async (
  emailOrPhone,
  role = "",
  withError = false
) => {
  try {
    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: { $eq: emailOrPhone } },
        { "phone.full": { $eq: emailOrPhone } },
      ],
    });

    // Throwing error if no user found and `throwError = true`
    if (withError && !user) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.user.notFound;
      throw new ApiError(statusCode, message);
    }

    // Throwing error if a user was found but the specified `role` does not match
    // This happens in case of role is added as an argument
    // If role is falsy that means this search does not care of role
    if (withError && user && role && user.role !== role) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.user.foundWithInvalidRole;
      throw new ApiError(statusCode, message);
    }

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.findUserById = async (userId) => {
  try {
    return await User.findById(userId);
  } catch (err) {
    throw err;
  }
};

module.exports.validateToken = (token) => {
  try {
    return jwt.verify(token, process.env["JWT_PRIVATE_KEY"]);
  } catch (err) {
    throw err;
  }
};

module.exports.verifyEmailOrPhone = async (key, user, code) => {
  try {
    // Ensure that key is correct
    key = key.toLowerCase();
    if (!["email", "phone"].includes(key)) {
      // If not, then use the email
      key = "email";
    }

    // Check if user's email or phone is verified
    const isVerified =
      key === "email" ? user.isEmailVerified() : user.isPhoneVerified();
    if (isVerified) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.user[`${key}AlreadyVerified`];
      throw new ApiError(statusCode, message);
    }

    // Check if code is correct
    const isCorrectCode = user.isMatchingCode(key, code);
    if (!isCorrectCode) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.auth.incorrectCode;
      throw new ApiError(statusCode, message);
    }

    // Check if code is expired
    const isActiveCode = user.isValidCode(key);
    if (!isActiveCode) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.auth.expiredCode;
      throw new ApiError(statusCode, message);
    }

    // Verify user's email or phone
    if (key === "email") {
      user.verifyEmail();
    } else {
      user.verifyPhone();
    }

    return await user.save();
  } catch (err) {
    throw err;
  }
};

module.exports.resendEmailOrPhoneVerificationCode = async (key, user, lang) => {
  try {
    // Ensure that key is correct
    key = key.toLowerCase();
    if (!["email", "phone"].includes(key)) {
      // If not, then use the email
      key = "email";
    }

    // Check if user's email or phone is verified
    const isVerified =
      key === "email" ? user.isEmailVerified() : user.isPhoneVerified();
    if (isVerified) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.user[`${key}AlreadyVerified`];
      throw new ApiError(statusCode, message);
    }

    // Update user's email or phone verification code
    user.updateCode(key);

    // Save user to the DB
    await user.save();

    // Sending email or phone verification code to user's email or phone
    if (key === "email") {
      await emailService.sendRegisterEmail(lang, user.email, user);
    }

    // TODO: send phone verification code to user's phone
  } catch (err) {
    throw err;
  }
};

module.exports.changePassword = async (user, oldPassword, newPassword) => {
  try {
    // Decoding user's password and comparing it with the old password
    if (!(await user.comparePassword(oldPassword))) {
      const statusCode = httpStatus.UNAUTHORIZED;
      const message = errors.auth.incorrectOldPassword;
      throw new ApiError(statusCode, message);
    }

    // Decoding user's password and comparing it with the new password
    if (await user.comparePassword(newPassword)) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.auth.oldPasswordMatchNew;
      throw new ApiError(statusCode, message);
    }

    // Update user's password
    await user.updatePassword(newPassword);

    // Save user to the DB
    await user.save();
  } catch (err) {
    throw err;
  }
};

module.exports.sendResetPasswordCode = async (emailOrPhone, sendTo, lang) => {
  try {
    // Check if user exists
    const user = await this.findUserByEmailOrPhone(emailOrPhone);
    if (!user) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.auth.emailOrPhoneNotUsed;
      throw new ApiError(statusCode, message);
    }

    // Update user's reset password code
    user.updateCode("password");

    // Save user to the DB
    const updatedUser = await user.save();

    // Send reset password code to user's email or phone
    if (sendTo === "email") {
      await emailService.sendResetPasswordEmail(lang, user.email, updatedUser);
    } else {
      // TODO: send reset password code to user's phone.
    }
  } catch (err) {
    throw err;
  }
};

module.exports.resetPasswordWithCode = async (
  emailOrPhone,
  code,
  newPassword
) => {
  try {
    // Check if user exists
    const user = await this.findUserByEmailOrPhone(emailOrPhone);
    if (!user) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.auth.emailNotUsed;
      throw new ApiError(statusCode, message);
    }

    // Check if code is correct
    const isCorrectCode = user.isMatchingCode("password", code);
    if (!isCorrectCode) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.auth.incorrectCode;
      throw new ApiError(statusCode, message);
    }

    // Check if code is expired
    const isActiveCode = user.isValidCode("password");
    if (!isActiveCode) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.auth.expiredCode;
      throw new ApiError(statusCode, message);
    }

    // Update user's password
    await user.updatePassword(newPassword);

    // Save user to the DB
    await user.save();

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.updateProfile = async (
  lang,
  user,
  name,
  email,
  phone,
  avatar
) => {
  try {
    const body = {
      lang,
      name,
      email,
      phone,
      avatar,
    };

    return await updateUserProfile(user, body);
  } catch (err) {
    throw err;
  }
};

module.exports.sendNotification = async (
  userIds,
  title,
  body,
  data,
  callback
) => {
  try {
    // Find users with the given IDs
    const users = await User.find({ _id: { $in: userIds } });

    // Map users array to an array of device tokens
    const deviceTokens = users.map(async (user) => {
      // Add the notification to user's notifications array
      user.addNotification(title, body, data);

      // Save the user to the database
      await user.save();

      return user.deviceToken;
    });

    // Asking notifications service to send a notification
    // to the given users
    notificationsService.sendPushNotification(
      title,
      body,
      data,
      deviceTokens,
      callback
    );

    return true;
  } catch (err) {
    throw err;
  }
};

module.exports.seeNotifications = async (user) => {
  try {
    // Check all of user's notifications
    const isAllSeen = user.seeNotifications();

    // Throw an error if all of user's notifications
    // are already marked as seen
    if (isAllSeen) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.user.notificationsSeen;
      throw new ApiError(statusCode, message);
    }

    // Save user to the DB
    //
    // Because the `user.seeNotifications()` function marks all of
    // user's notifications as seen.
    await user.save();

    // Return user's notifications
    return user.notifications;
  } catch (err) {
    throw err;
  }
};

module.exports.clearNotifications = async (user) => {
  try {
    // Clear user's notifications
    const isEmpty = user.clearNotifications();

    // Check if user's notifications list is empty
    if (isEmpty) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.user.noNotifications;
      throw new ApiError(statusCode, message);
    }

    // Save user to the DB
    await user.save();

    // Return user's notifications
    return user.notifications;
  } catch (err) {
    throw err;
  }
};

///////////////////////////// ADMIN /////////////////////////////
module.exports.changeUserRole = async (emailOrPhone, role) => {
  try {
    // Check if user exists
    const user = await this.findUserByEmailOrPhone(emailOrPhone);
    if (!user) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.user.notFound;
      throw new ApiError(statusCode, message);
    }

    // Update user's role
    user.udpateRole(role);

    // Save user to the DB
    await user.save();

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.verifyUser = async (emailOrPhone) => {
  try {
    // Check if user exists
    const user = await this.findUserByEmailOrPhone(emailOrPhone);
    if (!user) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.user.notFound;
      throw new ApiError(statusCode, message);
    }

    // Check if user's email and phone are already verified
    if (user.isEmailVerified() && user.isPhoneVerified()) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.user.alreadyVerified;
      throw new ApiError(statusCode, message);
    }

    // Verify user's email
    user.verifyEmail();

    // Verify user's phone
    user.verifyPhone();

    // Save user to the DB
    await user.save();

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.updateUserProfile = async (
  lang,
  emailOrPhone,
  name,
  email,
  phone,
  avatar
) => {
  try {
    // Check if user exists
    const user = await this.findUserByEmailOrPhone(emailOrPhone);
    if (!user) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.user.notFound;
      throw new ApiError(statusCode, message);
    }

    const body = {
      lang,
      name,
      email,
      phone,
      avatar,
    };

    return await updateUserProfile(user, body);
  } catch (err) {
    throw err;
  }
};

const updateUserProfile = async (user, body) => {
  try {
    const { name, avatar, email, phone, lang } = body;

    // To store changes
    const changes = [];

    // Update user's name when there's new name
    if (name && user.name !== name) {
      // Update user's name
      user.name = name;

      // Add user's name to changes
      changes.push("name");
    }

    // Updating avatar when there's new avatar
    if (avatar) {
      // Store new user's avatar locally
      const file = await localStorage.storeFile(avatar);

      // Delete local user's old avatar
      await localStorage.deleteFile(user.avatarURL);

      // Update user's avatar URL
      user.avatarURL = file.path;

      // Add user's avatar to changes
      changes.push("avatarURL");
    }

    // Update user's email when there's new email
    if (email && user.email !== email) {
      // Check if email is already used by another user
      const emailUsed = await this.findUserByEmailOrPhone(email);
      if (emailUsed) {
        const statusCode = httpStatus.NOT_FOUND;
        const message = errors.auth.emailUsed;
        throw new ApiError(statusCode, message);
      }

      // Update user's email
      user.email = email;

      // Mark user's email as not verified
      user.verified.email = false;

      // Add user's email to changes
      changes.push("email");

      // Update user's email verification code
      user.updateCode("email");

      // Send an email to user's new email including email verification code
      await emailService.sendChangeEmail(lang, email, user);
    }

    // Check if user's email matches new email
    const isPhoneEqual =
      user.phone.icc === phone?.icc && user.phone.nsn === phone?.nsn;

    // Update user's phone when there's new phone
    if (phone && !isPhoneEqual) {
      // Check if phone is already used by another user
      const fullPhone = `${phone.icc}${phone.nsn}`;
      const phoneUsed = await this.findUserByEmailOrPhone(fullPhone);
      if (phoneUsed) {
        const statusCode = httpStatus.NOT_FOUND;
        const message = errors.auth.phoneUsed;
        throw new ApiError(statusCode, message);
      }

      // Update user's phone
      user.phone = {
        full: `${phone.icc}${phone.nsn}`,
        icc: phone.icc,
        nsn: phone.nsn,
      };

      // Mark user's phone as not verified
      user.verified.phone = false;

      // Add user's phone to changes
      changes.push("phone");

      // Update user's phone verification code
      user.updateCode("phone");

      // TODO: send phone verification code to user's email.
    }

    // Check if nothing has changes
    if (!changes.length) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.user.notUpdated;
      throw new ApiError(statusCode, message);
    }

    // Save user to the DB
    await user.save();

    return { newUser: user, changes };
  } catch (err) {
    throw err;
  }
};
