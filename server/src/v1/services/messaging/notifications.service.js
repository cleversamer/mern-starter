const admin = require("firebase-admin");
const FCM = require("fcm-notification");
const serviceAccount = require("../../config/system/firebase-app-key.json");
const certPath = admin.credential.cert(serviceAccount);

const fcm = new FCM(certPath);

module.exports.sendPushNotification = (title, body, data, tokens, callback) => {
  try {
    let payload = {
      data,
      notification: {
        title,
        body,
      },
    };

    fcm.sendToMultipleToken(payload, tokens, callback);
  } catch (err) {
    throw err;
  }
};
