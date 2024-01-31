const axios = require("axios");

const validateGST = async (gst) => {
  // try {
  //   const res = await axios.get(`${process.env.GST_VALIDATION_API}/${gst}`);
  //   if (res.data.data) {
  //     return res.data;
  //   } else {
  //     return {
  //       flag: false,
  //       message: "Invalid GSTIN Number.",
  //       errorCode: "INVALID_GSTNUMBER",
  //     };
  //   }
  // } catch (error) {
  //   return {
  //     flag: false,
  //     message: "Invalid GSTIN Number.",
  //     errorCode: "INVALID_GSTNUMBER",
  //   };
  // }

  const axios = require("axios");

  const options = {
    method: "GET",
    url: `${process.env.GST_RETURN_STATUS}/${gst}`,
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": process.env.RAPID_API_CLIENT_KEY,
      "X-RapidAPI-Host": process.env.RAPID_API_HOST,
    },
  };

  try {
    const response = await axios.request(options);

    if (response.data && response.data.success) {
      return { success: true, data: response.data.data };
    } else if (response.data.success === false) {
      console.log({ status: 400, message: response.data.data.message }, "here");
      return { success: false, message: response.data.data.message };
    } else {
      return { success: false, message: "Something went wrong" };
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: "Interval server error" };
  }
};

module.exports = { validateGST };
