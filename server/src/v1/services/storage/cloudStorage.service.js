const { Storage } = require("@google-cloud/storage");
const path = require("path");

const uploadFile = async (file = { name: "", path: "" }) => {
  try {
    const storage = new Storage({
      keyFilename: path.join(__dirname, "../../bayan-platform-storage.json"),
      projectId: "bayan-platform",
    });

    const bucketName = "bayan-bucket-1";
    const filePath = path.join(__dirname, `../../../../uploads${file.path}`);
    const destFileName = file.name;
    const generationMatchPrecondition = 0;

    const options = {
      destination: destFileName,
      preconditionOpts: {
        ifGenerationMatch: generationMatchPrecondition,
      },
    };

    const cloudFile = await storage
      .bucket(bucketName)
      .upload(filePath, options);

    return cloudFile[1].mediaLink;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  uploadFile,
};
