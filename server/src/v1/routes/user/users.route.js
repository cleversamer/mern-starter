const router = require("express").Router();
const { usersController } = require("../../controllers");
const { authValidator, userValidator } = require("../../middleware/validation");
const auth = require("../../middleware/auth");

router.get(
  "/isauth",
  authValidator.isAuthValidator,
  auth("readOwn", "user", true),
  usersController.isAuth
);

router
  .route("/verify-email")
  .get(
    authValidator.resendCodeValidator,
    auth("readOwn", "emailVerificationCode", true),
    usersController.resendEmailOrPhoneVerificationCode("email")
  )
  .post(
    authValidator.codeValidator,
    auth("updateOwn", "emailVerificationCode", true),
    usersController.verifyEmailOrPhone("email")
  );

router
  .route("/verify-phone")
  .get(
    authValidator.resendCodeValidator,
    auth("readOwn", "phoneVerificationCode", true),
    usersController.resendEmailOrPhoneVerificationCode("phone")
  )
  .post(
    authValidator.codeValidator,
    auth("updateOwn", "phoneVerificationCode", true),
    usersController.verifyEmailOrPhone("phone")
  );

router
  .route("/forgot-password")
  .get(
    authValidator.getForgotPasswordCode,
    usersController.sendForgotPasswordCode
  )
  .post(
    authValidator.forgotPasswordValidator,
    usersController.handleForgotPassword
  );

router.patch(
  "/change-password",
  authValidator.changePasswordValidator,
  auth("updateOwn", "password"),
  usersController.changePassword
);

router.patch(
  "/update",
  userValidator.validateUpdateProfile,
  auth("updateOwn", "user"),
  usersController.updateProfile
);

router.get(
  "/see-notifications",
  auth("readOwn", "notification"),
  usersController.seeNotifications
);

router.delete(
  "/clear-notifications",
  auth("deleteOwn", "notification"),
  usersController.clearNotifications
);

////////////// ADMIN APIs //////////////
router.patch(
  "/admin/update-profile",
  userValidator.validateUpdateUserProfile,
  auth("updateAny", "user"),
  usersController.updateUserProfile
);

router.patch(
  "/admin/change-user-role",
  userValidator.validateUpdateUserRole,
  auth("updateAny", "user"),
  usersController.changeUserRole
);

router.patch(
  "/admin/verify-user",
  userValidator.validateVerifyUser,
  auth("updateAny", "user"),
  usersController.verifyUser
);

router.get(
  "/admin/find-user",
  userValidator.validateFindUserByEmailOrPhone,
  auth("readAny", "user"),
  usersController.findUserByEmailOrPhone
);

router.post(
  "/send-notification",
  auth("createAny", "notification"),
  usersController.sendNotification
);

module.exports = router;
