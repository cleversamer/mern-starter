const { server } = require("../../system");

module.exports = Object.freeze({
  internal: {
    en: "An unexpected error happened on the server",
    ar: "حصل خطأ غير متوقع في الخادم",
  },
  unsupportedRoute: {
    en: "Unsupported route",
    ar: "الرابط غير مدعوم",
  },
  noPhoto: {
    en: "Please add a photo",
    ar: "يجب عليك إضافة صورة",
  },
  invalidFile: {
    en: "Invalid file",
    ar: "الملف غير صالح",
  },
  fileUploadError: {
    en: "Error uploading file",
    ar: "حصل خطأ عند رفع الملف",
  },
  invalidUrl: {
    en: "Please add a valid URL",
    ar: "من فضلك قم بإدخال رابط صالح",
  },
  invalidExtension: {
    en: "File extension is not supported",
    ar: "إمتداد الملف غير مدعوم",
  },
  invalidMongoId: {
    en: "Invalid ID",
    ar: "معرّف غير صالح",
  },
  noMongoId: {
    en: "You should add the ID",
    ar: "يجب عليك إضافة المعرّف",
  },
  largeFile: {
    en: `Maximum file upload size is ${server.MAX_FILE_UPLOAD_SIZE}MB`,
    ar: `الحد الأقصى لحجم ملف الرفع هو ${server.MAX_FILE_UPLOAD_SIZE} ميجا بايت`,
  },
  tempBlocked: {
    en: "Your device has been temporarily blocked",
    ar: "تم حظر جهازك مؤقتًا",
  },
  notification: {
    en: "Error sending notification",
    ar: "حصل خطأ عند إرسال الإشعار",
  },
});
