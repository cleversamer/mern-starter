const commonMiddleware = require("../common");

const isAuthValidator = [
  commonMiddleware.putQueryParamsInBody,
  commonMiddleware.conditionalCheck(
    "deviceToken",
    commonMiddleware.checkDeviceToken
  ),
  commonMiddleware.next,
];

const loginValidator = [
  commonMiddleware.checkEmailOrPhone,
  commonMiddleware.checkPassword,
  commonMiddleware.conditionalCheck(
    "deviceToken",
    commonMiddleware.checkDeviceToken
  ),
  commonMiddleware.checkAuthType,
  commonMiddleware.authTypeHandler,
];

const registerValidator = [
  commonMiddleware.checkLanguage,
  commonMiddleware.checkName,
  commonMiddleware.checkEmail,
  commonMiddleware.checkPhone,
  commonMiddleware.checkPassword,
  commonMiddleware.checkRole(true),
  commonMiddleware.conditionalCheck(
    "deviceToken",
    commonMiddleware.checkDeviceToken
  ),
  commonMiddleware.checkAuthType,
  commonMiddleware.authTypeHandler,
];

const changePasswordValidator = [
  commonMiddleware.checkOldPassword,
  commonMiddleware.checkNewPassword,
  commonMiddleware.next,
];

const forgotPasswordValidator = [
  commonMiddleware.checkEmailOrPhone,
  commonMiddleware.checkNewPassword,
  commonMiddleware.checkCode,
  commonMiddleware.next,
];

const getForgotPasswordCode = [
  commonMiddleware.putQueryParamsInBody,
  commonMiddleware.checkEmailOrPhone,
  commonMiddleware.checkLanguage,
  commonMiddleware.checkSendTo,
  commonMiddleware.next,
];

const emailValidator = [commonMiddleware.checkEmail, commonMiddleware.next];

const codeValidator = [commonMiddleware.checkCode, commonMiddleware.next];

const resendCodeValidator = [
  commonMiddleware.putQueryParamsInBody,
  commonMiddleware.checkLanguage,
  commonMiddleware.next,
];

module.exports = {
  isAuthValidator,
  loginValidator,
  registerValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  emailValidator,
  getForgotPasswordCode,
  codeValidator,
  resendCodeValidator,
};
