const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const client = new S3Client({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
    region: "us-east-1"
});

const uploadFile = async (file) => {
    const params = {
        ACL: "private" || "public-read" || "public-read-write",
        Bucket: "freelance-ipan-bucket",
        Key: "document/" + file.originalname,
        Body: file.buffer,
        ContentType: 'application/pdf',
    };

    const command = new PutObjectCommand(params);

    try {
        const data = await client.send(command);
        console.log(data);
    } catch (error) {
        console.log(error);
    }
}

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