const { Schema, model } = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { server } = require("../../config/system");
const { user: validation } = require("../../config/models");
const countriesData = require("../../data/countries");

const clientSchema = [
  "_id",
  "avatarURL",
  "name",
  "email",
  "phone",
  "role",
  "notifications",
  "verified",
  "createdAt",
  "lastLogin",
];

const verification = {
  email: {
    expiryInMins: 10,
    codeLength: validation.verificationCode.exactLength,
  },
  phone: {
    expiryInMins: 10,
    codeLength: validation.verificationCode.exactLength,
  },
  password: {
    expiryInMins: 10,
    codeLength: validation.verificationCode.exactLength,
  },
};

const userSchema = new Schema(
  {
    // The URL of user's avatar
    avatarURL: {
      type: String,
      default: "",
      trim: true,
    },
    // The full name of the user
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: validation.name.minLength,
      maxLength: validation.name.maxLength,
    },
    // The email of the user
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minLength: validation.email.minLength,
      maxLength: validation.email.maxLength,
    },
    // The phone of the user
    phone: {
      // The full phone number (icc + nsn)
      full: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: countriesData.minPhone,
        maxlength: countriesData.maxPhone,
      },
      // The icc of user's phone
      icc: {
        type: String,
        required: true,
        trim: true,
        enum: countriesData.countries.map((c) => c.icc),
        minlength: countriesData.minICC,
        maxlength: countriesData.maxICC,
      },
      // The nsn of user's phone
      nsn: {
        type: String,
        required: true,
        trim: true,
        minLength: countriesData.minNSN,
        maxLength: countriesData.maxNSN,
      },
    },
    // The hashed password of the user
    password: {
      type: String,
      trim: true,
      default: "",
    },
    // The role of the user
    role: {
      type: String,
      enum: validation.roles,
      default: validation.roles[0],
      trim: true,
    },
    // The email and phone verification status of the user
    verified: {
      email: {
        type: Boolean,
        default: false,
      },
      phone: {
        type: Boolean,
        default: false,
      },
    },
    // All notifications that the user has received
    notifications: {
      type: Array,
      default: [],
    },
    // The device token of user's phone
    deviceToken: {
      type: String,
      required: true,
      trim: true,
      minLength: validation.deviceToken.minLength,
      maxLength: validation.deviceToken.maxLength,
    },
    // The last login date of the user
    lastLogin: {
      type: String,
      default: new Date(),
    },
    // The email, phone, and password verification codes
    verification: {
      email: {
        code: {
          type: String,
          default: "",
          trim: true,
        },
        expiryDate: {
          type: String,
          default: "",
          trim: true,
        },
      },
      phone: {
        code: {
          type: String,
          default: "",
          trim: true,
        },
        expiryDate: {
          type: String,
          default: "",
          trim: true,
        },
      },
      password: {
        code: {
          type: String,
          default: "",
          trim: true,
        },
        expiryDate: {
          type: String,
          default: "",
          trim: true,
        },
      },
    },
  },
  {
    // To not avoid empty object when creating the document
    minimize: false,
    // To automatically write creation/update timestamps
    // Note: the update timestamp will be updated automatically
    timestamps: true,
  }
);

userSchema.methods.genAuthToken = function () {
  try {
    // The body of the token (Encrypted)
    const body = {
      sub: this._id.toHexString(),
      email: this.email,
      phone: this.phone.full,
      password: this.password + server.PASSWORD_SALT,
    };

    // Generate a new token for this user with the above info
    return jwt.sign(body, process.env["JWT_PRIVATE_KEY"]);
  } catch (err) {
    // TODO: write the error to the database
    return "auth-token-error";
  }
};

userSchema.methods.updateLastLogin = function () {
  // Update user's last login
  this.lastLogin = new Date();
};

userSchema.methods.genCode = function (length = 4) {
  try {
    // Generate a random numeric code with the specified length
    const possibleNums = Math.pow(10, length - 1);
    return Math.floor(possibleNums + Math.random() * 9 * possibleNums);
  } catch (err) {
    // TODO: write the error to the database
  }
};

userSchema.methods.updateCode = function (key) {
  try {
    // Get verification type data
    const { codeLength, expiryInMins } = verification[key];

    // Generate code
    const code = this.genCode(codeLength);

    // Generate expiry date
    const mins = expiryInMins * 60 * 1000;
    const expiryDate = new Date() + mins;

    // Update email verification code
    this.verification[key] = { code, expiryDate };
  } catch (err) {
    // TODO: write the error to the database
  }
};

userSchema.methods.isMatchingCode = function (key, code) {
  try {
    // Return if the arg `code` === verification type code
    return this.verification[key].code == code;
  } catch (err) {
    // TODO: write the error to the database
    return false;
  }
};

userSchema.methods.isValidCode = function (key) {
  try {
    // Get expiry date for the verification type
    const { expiryDate } = this.verification[key];
    // Get the allowed time of the verification type
    const { expiryInMins } = verification[key];

    // Measure the difference between now and code's expiry date
    const diff = new Date() - new Date(expiryDate);

    // Calculate expiry mins in milliseconds
    const time = expiryInMins * 60 * 1000;

    // Return true if milliseconds are greater than the difference
    // Otherwise, return false...
    return diff <= time;
  } catch (err) {
    // TODO: write the error to the database
    return false;
  }
};

userSchema.methods.isEmailVerified = function () {
  // Return if user's email is verified
  return this.verified.email;
};

userSchema.methods.verifyEmail = function () {
  // Verify user's email
  this.verified.email = true;
};

userSchema.methods.isPhoneVerified = function () {
  // Return if user's phone is verified
  return this.verified.phone;
};

userSchema.methods.verifyPhone = function () {
  // Verify user's phone
  this.verified.phone = true;
};

userSchema.methods.comparePassword = async function (candidate) {
  try {
    // Return if the `newPassword` arg === user's password
    // after decrypting user's password
    return await bcrypt.compare(candidate, this.password);
  } catch (err) {
    // TODO: write the error to the database
    return false;
  }
};

userSchema.methods.updatePassword = async function (newPassword) {
  try {
    // Generate a salt for hasing the password
    const salt = await bcrypt.genSalt(10);
    // Hash the password
    const hashed = await bcrypt.hash(newPassword, salt);
    // Update user's password
    this.password = hashed;
  } catch (err) {
    // TODO: write the error to the database
  }
};

userSchema.methods.addNotification = function (
  title,
  body,
  data,
  date = new Date()
) {
  try {
    // Construct the notification
    const notification = { title, body, data, date, seen: false };

    // Making sure that the max notifications count
    // is considered.
    const { maxNotificationsCount } = validation;
    this.notifications = this.notifications.slice(0, maxNotificationsCount);
    if (this.notifications.length === maxNotificationsCount) {
      this.notifications.pop();
    }

    // Add the notification to the beginning of the array
    this.notifications.unshift(notification);
  } catch (err) {
    // TODO: write the error to the database
  }
};

userSchema.methods.seeNotifications = function () {
  try {
    // Return `true` if there are no notifications
    // True means no new notifications
    if (!this.notifications.length) {
      return true;
    }

    // Declare a variable to track unseen notifications
    let isAllSeen = true;

    // Mark all notification as seen
    this.notifications = this.notifications.map((n) => {
      isAllSeen = isAllSeen && n.seen;

      return {
        ...n,
        seen: true,
      };
    });

    // Return the result
    return isAllSeen;
  } catch (err) {
    // TODO: write the error to the database
    return false;
  }
};

userSchema.methods.clearNotifications = function () {
  try {
    // Check if notifications array is empty
    const isEmpty = !this.notifications.length;
    // Empty the notifications array
    this.notifications = [];

    return isEmpty;
  } catch (err) {
    // TODO: write the error to the database
    return false;
  }
};

// Creating user model
const User = model("User", userSchema);

module.exports = {
  User,
  clientSchema,
};
