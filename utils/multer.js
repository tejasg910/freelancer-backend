const multer = require("multer");

const fs = require("fs");
const uploadsDir = __dirname + "/../uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
async function uploadFile(file) {
  return new Promise((resolve, reject) => {
    const filePath = uploadsDir + "/" + file.filename; // Adjust the path accordingly
    // Move the uploaded file to the specified location
    fs.rename(file.path, filePath, (err) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(filePath);
      }
    });
  });
}
// Define storage for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the local folder where you want to store the files
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Use a unique filename for each uploaded file
    cb(null, Date.now() + "-" + file.originalname);
  },
});
// Create a Multer instance with the configured storage
const upload = multer({ storage: storage });

module.exports = { upload, uploadFile };
