const {
  deviceToken,
  email,
  name,
  verificationCode,
  password,
} = require("../../../config/models/user/user");

module.exports = Object.freeze({
  invalidCode: {
    en: `Verification code should be ${verificationCode.exactLength} characters length`,
    ar: `كود التحقق يجب أن يكون ${verificationCode.exactLength} حرفًا`,
  },
  incorrectCode: {
    en: "Incorrect verification code",
    ar: "كود التحقق غير صحيح",
  },
  expiredCode: {
    en: "Verification code is expired",
    ar: "كود التحقق منتهي الصلاحيّة",
  },
  invalidToken: {
    en: "You have to login in order to perform this action",
    ar: "يجب عليك تسجيل الدخول لتقوم بهذه العمليّة",
  },
  hasNoRights: {
    en: "You don’t have enough rights",
    ar: "ليس لديك الصلاحيّات الكافية",
  },
  phoneNotVerified: {
    en: "You have to verify your phone number to continue using the app",
    ar: "يجب عليك تفعيل رقم هاتفك لتتمكن من إستخدام التطبيق",
  },
  emailNotUsed: {
    en: "Email is not used",
    ar: "البريد الإلكتروني غير مستخدم",
  },
  emailOrPhoneUsed: {
    en: "Email or phone number is already used",
    ar: "البريد الإلكتروني أو رقم الهاتف مستخدم مسبقًا",
  },
  emailOrPhoneNotUsed: {
    en: "Email or phone number is not used",
    ar: "البريد الإلكتروني أو رقم الهاتف غير مستخدم",
  },
  emailUsed: {
    en: "Email address is already used",
    ar: "البريد الإلكتروني مستخدم مسبقًا",
  },
  phoneUsed: {
    en: "Phone number is already used",
    ar: "رقم الهاتف مستخدم مسبقًا",
  },
  incorrectCredentials: {
    en: "Incorrect login credentials",
    ar: "بيانات الدخول غير صحيحة",
  },
  incorrectOldPassword: {
    en: "Old password is incorrect",
    ar: "كلمة المرور القديمة غير صحيحة",
  },
  oldPasswordMatchNew: {
    en: "New password matches old password",
    ar: "كلمة المرور الجديدة تطابق كلمة المرور القديمة",
  },
  invalidName: {
    en: `Name should be ${name.minLength}-${name.maxLength} characters length`,
    ar: `الإسم يجب أن يكون بين ${name.minLength}-${name.maxLength} حرفًا`,
  },
  invalidEmail: {
    en: `Email should be a valid email and is between ${email.minLength}-${email.maxLength} characters length`,
    ar: `البريد الإلكتروني يجب أن يكون بريد صالح وطوله بين ${email.minLength}-${email.maxLength} حرفًا`,
  },
  invalidEmailOrPhone: {
    en: "Invalid email or phone number",
    ar: "البريد الإلكتروني أو رقم الهاتف غير صالح",
  },
  invalidPhone: {
    en: "Invalid phone number",
    ar: "رقم الهاتف غير صالح",
  },
  invalidICC: {
    en: "Invalid international calling code (ICC)",
    ar: "مقدّمة الدولة غير صالحة",
  },
  phoneNotOnlyNumbers: {
    en: "Phone number should contain only numbers",
    ar: "رقم الهاتف يجب أن يحتوي على أرقام فقط",
  },
  invalidPassword: {
    en: `Password should be ${password.minLength}-${password.maxLength} characters length`,
    ar: `كلمة المرور يجب أن تكون بين ${password.minLength}-${password.maxLength} حرفًا`,
  },
  invalidOldPassword: {
    en: `Old password should be ${password.minLength}-${password.maxLength} characters length`,
    ar: `كلمة المرور القديمة يجب أن تكون بين ${password.minLength}-${password.maxLength} حرفًا`,
  },
  invalidNewPassword: {
    en: `New password should be ${password.minLength}-${password.maxLength} characters length`,
    ar: `كلمة المرور الجديدة يجب أن تكون بين ${password.minLength}-${password.maxLength} حرفًا`,
  },
  invalidDeviceToken: {
    en: `Device token should be ${deviceToken.minLength}-${deviceToken.maxLength} characters length`,
    ar: `معرّف الجهاز يجب أن يكون بين ${deviceToken.minLength}-${deviceToken.maxLength} حرفًا`,
  },
  invalidGoogleToken: {
    en: "There's an issue with your google mail",
    ar: "يوجد هناك مشكلة في بريد جوجل الخاص بك",
  },
  googleAuthError: {
    en: "Google authentication is temporarily disabled",
    ar: "تم تعطيل مصادقة جوجل مؤقتًا",
  },
  invalidAuthType: {
    en: "Auth type should be either email or google",
    ar: "نوع المصادقة يجب أن يكون إما عبر البريد أو جوجل",
  },
});
