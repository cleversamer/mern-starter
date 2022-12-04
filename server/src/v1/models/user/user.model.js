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
    codeLength: 6,
  },
  phone: {
    expiryInMins: 10,
    codeLength: 6,
  },
  password: {
    expiryInMins: 10,
    codeLength: 6,
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
  const body = {
    sub: this._id.toHexString(),
    email: this.email,
    phone: this.phone.full,
    password: this.password + server.PASSWORD_SALT,
  };

  return jwt.sign(body, process.env["JWT_PRIVATE_KEY"]);
};

userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
};

userSchema.methods.genCode = function (length = 4) {
  const possibleNums = Math.pow(10, length - 1);
  return Math.floor(possibleNums + Math.random() * 9 * possibleNums);
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
    // TODO: write the error to db
  }
};

userSchema.methods.isMatchingCode = function (key, code) {
  try {
    return this.verification[key].code == code;
  } catch (err) {
    // TODO: write the error to db
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
    // TODO: write the error to db
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
  return await bcrypt.compare(candidate, this.password);
};

userSchema.methods.updatePassword = async function (newPassword) {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(newPassword, salt);
  this.password = hashed;
};

userSchema.methods.addNotification = function (content) {
  const notification = { content, seen: false };

  if (this.notifications.length === 10) {
    this.notifications.pop();
  }

  this.notifications.unshift(notification);
};

userSchema.methods.seeNotifications = function () {
  this.notifications = this.notifications.map((n) => ({
    ...n,
    seen: true,
  }));
};

const User = model("User", userSchema);

module.exports = {
  User,
  CLIENT_SCHEMA,
  SUPPORTED_ROLES,
};
