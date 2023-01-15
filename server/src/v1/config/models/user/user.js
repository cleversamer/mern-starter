module.exports = {
  name: { minLength: 8, maxLength: 64 },
  email: { minLength: 6, maxLength: 256 },
  phone: {
    nsn: { minLength: 4, maxLength: 13 },
  },
  deviceToken: { minLength: 0, maxLength: 1024, default: "" },
  // First role in this array === default role
  roles: ["user", "admin"],
  registerRoles: ["user"],
  // First auth type in this array === default auth type
  authTypes: ["email", "google"],
  password: { minLength: 8, maxLength: 64 },
  verificationCode: { exactLength: 4 },
  receiverTypes: ["email", "phone"],
  maxNotificationsCount: 10,
};
