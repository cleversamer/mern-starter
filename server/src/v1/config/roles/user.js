module.exports = Object.freeze({
  user: {
    "read:own": ["*"],
    "update:own": ["*"],
  },
  emailVerificationCode: {
    "read:own": ["*"],
    "update:own": ["*"],
  },
  phoneVerificationCode: {
    "read:own": ["*"],
    "update:own": ["*"],
  },
  password: {
    "update:own": ["*"],
  },
  notification: {
    "read:own": ["*"],
    "delete:own": ["*"],
  },
});
