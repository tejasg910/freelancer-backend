const axios = require("axios");

const validateGST = async (gst) => {
  try {
    const res = await axios.get(`${process.env.GST_VALIDATION_API}/${gst}`);
    if (res.data.data) {
      return res.data;
    } else {
      return {
        flag: false,
        message: "Invalid GSTIN Number.",
        errorCode: "INVALID_GSTNUMBER",
      };
    }
  } catch (error) {
    return {
      flag: false,
      message: "Invalid GSTIN Number.",
      errorCode: "INVALID_GSTNUMBER",
    };
  }
};

module.exports = { validateGST };
