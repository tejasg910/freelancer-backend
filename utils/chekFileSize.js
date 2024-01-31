const checkFileSize = (file) => {
  // Assuming the file size is in bytes
  const fileSizeInBytes = file.size;

  // Convert bytes to megabytes
  const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

  // Check if the file size is greater than 1 MB
  if (fileSizeInMB > 1) {
    return false; // File size is greater than 1 MB
  } else {
    return true; // File size is 1 MB or less
  }
};

module.exports = { checkFileSize };
