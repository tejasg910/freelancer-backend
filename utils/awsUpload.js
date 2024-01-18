const {
  S3Client,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

const client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
  },
 
});


const uploadFile = async (file, folder) => {

  let contentType;
  if (file.mimetype.startsWith("image/")) {
    contentType = "image/jpeg";
  } else if (file.mimetype === "application/pdf") {
    contentType = "application/pdf";
  } else {
    contentType = "application/octet-stream";
  }

  const params = {
    ACL: "public-read",
    Bucket: "freelance-ipan-bucket",
    Key: `${folder}/` + file.originalname,
    Body: file.buffer,
    ContentType: contentType
  };

  const uploadCommand = new PutObjectCommand(params);

  try {
    const uploadData = await client.send(uploadCommand);
    if (uploadData.$metadata.httpStatusCode === 200) {
      const bucketName = "freelance-ipan-bucket";
      const objectKey = `${folder}/${file.originalname}`;
      const region = "us-east-1";
      const downloadUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${objectKey}`;
      const url = downloadUrl;
      return url;
    }
  } catch (error) {
    console.log("Error while Upload File", error);
    throw error; 
  }
};

module.exports = { uploadFile };

