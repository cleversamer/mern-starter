const { Schema, model } = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { server } = require("../../config/system");

const CLIENT_SCHEMA = [
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

const SUPPORTED_ROLES = ["user", "admin"];

const verification = {
  email: {
    expiryInMins: 10,
    codeLength: 4,
  },
  phone: {
    expiryInMins: 10,
    codeLength: 4,
  },
  password: {
    expiryInMins: 10,
    codeLength: 4,
  },
};

const MAX_NOTIFICATIONS_COUNT = 10;

const userSchema = new Schema(
  {
    avatarURL: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      full: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
      icc: {
        type: String,
        required: true,
        trim: true,
      },
      nsn: {
        type: String,
        required: true,
        trim: true,
      },
    },
    password: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      enum: SUPPORTED_ROLES,
      default: "user",
    },
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
    notifications: {
      type: Array,
      default: [],
    },
    deviceToken: {
      type: String,
      required: true,
    },
    lastLogin: {
      type: String,
      default: new Date(),
    },
    verification: {
      email: {
        code: {
          type: String,
          default: "",
        },
        expiryDate: {
          type: String,
          default: "",
        },
      },
      phone: {
        code: {
          type: String,
          default: "",
        },
        expiryDate: {
          type: String,
          default: "",
        },
      },
      password: {
        code: {
          type: String,
          default: "",
        },
        expiryDate: {
          type: String,
          default: "",
        },
      },
    },
  },
  {
    minimize: false,
    timestamps: true,
  }
);

//////////////////// User's General Methods ////////////////////
userSchema.methods.genAuthToken = function () {
  try {
    const body = {
      sub: this._id.toHexString(),
      email: this.email,
      phone: this.phone.full,
      password: this.password + server.PASSWORD_SALT,
    };

    return jwt.sign(body, process.env["JWT_PRIVATE_KEY"]);
  } catch (err) {
    // TODO: write the error to the database
    return "auth-token-error";
  }
};

userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
};

userSchema.methods.genCode = function (length = 4) {
  try {
    const possibleNums = Math.pow(10, length - 1);
    return Math.floor(possibleNums + Math.random() * 9 * possibleNums);
  } catch (err) {
    // TODO: write the error to the database
  }
};

userSchema.methods.updateCode = function (key) {
  try {
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
    return this.verification[key].code == code;
  } catch (err) {
    // TODO: write the error to the database
    return false;
  }
};

userSchema.methods.isValidCode = function (key) {
  try {
    const { expiryDate } = this.verification[key];
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
  return this.verified.email;
};

userSchema.methods.verifyEmail = function () {
  this.verified.email = true;
};

userSchema.methods.isPhoneVerified = function () {
  return this.verified.phone;
};

userSchema.methods.verifyPhone = function () {
  this.verified.phone = true;
};

userSchema.methods.comparePassword = async function (candidate) {
  try {
    return await bcrypt.compare(candidate, this.password);
  } catch (err) {
    // TODO: write the error to the database
    return false;
  }
};

userSchema.methods.updatePassword = async function (newPassword) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
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
    this.notifications = this.notifications.slice(0, MAX_NOTIFICATIONS_COUNT);
    if (this.notifications.length === MAX_NOTIFICATIONS_COUNT) {
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
    const isEmpty = !this.notifications.length;
    this.notifications = [];
    return isEmpty;
  } catch (err) {
    // TODO: write the error to the database
    return false;
  }
};

const User = model("User", userSchema);

module.exports = {
  User,
  CLIENT_SCHEMA,
  SUPPORTED_ROLES,
};
