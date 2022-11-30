const fs = require("fs");
const crypto = require("crypto");
const httpStatus = require("http-status");
const { ApiError } = require("../../middleware/apiError");
const errors = require("../../config/errors");

module.exports.storeFile = async (file, title = "") => {
  try {
    const readFile = Buffer.from(file.data, "base64");

    const diskName = title
      ? `${title}_${getCurrentDate()}`
      : crypto.randomUUID();

    const nameParts = file.name.split(".");
    const extension = nameParts[nameParts.length - 1];

    const name = `${diskName}.${extension}`;
    const path = `/${name}`;
    fs.writeFileSync(`./uploads${path}`, readFile, "utf8");

    return { originalName: file.name, name, path };
  } catch (err) {
    const statusCode = httpStatus.BAD_REQUEST;
    const message = errors.system.fileUploadError;
    throw new ApiError(statusCode, message);
  }
};

module.exports.deleteFile = async (filePath) => {
  try {
    fs.unlink(`./uploads${filePath}`, (err) => {});
    return true;
  } catch (err) {
    if (!(err instanceof ApiError)) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.system.fileUploadError;
      err = new ApiError(statusCode, message);
    }

    throw err;
  }
};

const getCurrentDate = () => {
  let strDate = new Date().toLocaleString();
  strDate = strDate.split(", ");
  let part1 = strDate[0];
  let part2 = strDate[1].split(" ");
  let part21 = part2[0].split(":").slice(0, 2).join(":");
  let part22 = part2[1];
  return `${part1}_${part21}_${part22}`;
};
