const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");

const client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
  },
  // accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  // secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
});

const uploadFile = async (file) => {
  const params = {
    ACL: "public-read",
    Bucket: "freelance-ipan-bucket",
    Key: "document/" + file.originalname,
    Body: file.buffer,
    ContentType: "application/pdf",
  };

  const uploadCommand = new PutObjectCommand(params);

  try {
    const uploadData = await client.send(uploadCommand);
    if (uploadData.$metadata.httpStatusCode === 200) {
      const bucketName = "freelance-ipan-bucket";
      const objectKey = `document/${file.originalname}`;
      const region = "us-east-1";
      // const getUrlCommand = new GetObjectCommand(getObjectParams);
      const downloadUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${objectKey}`;
      const url = downloadUrl;
      return url;
    }
  } catch (error) {
    console.error(error);
    throw error; // Rethrow the error to handle it at a higher level
  }
};

module.exports = { uploadFile };

// const aws = require("aws-sdk");

// aws.config.update({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
//     region: " us-east-1"
// });

// let uploadFile = async (file) => {
//     console.log(file);
//     return new Promise(function (resolve, reject) {
//         let s3 = new aws.S3({ apiVersion: "2006-03-01" });

//         var uploadParams = {
//             ACL: "public-read",
//             Bucket: "freelance-ipan-bucket",
//             Key: "document/" + file.originalname,
//             Body: file.buffer,
//             ContentType: 'application/pdf',
//         };

//         s3.upload(uploadParams, function (err, data) {
//             if (err) {
//                 return reject({ error: err });
//             }
//             return resolve(data.Location);
//         });
//     });
// };

// module.exports = { uploadFile };
