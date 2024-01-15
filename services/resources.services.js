const addResourcesServices = async (files) => {
  console.log(files);
  return {
    status: 200,
    message: "got files",
  };
};
module.exports = {
  addResourcesServices,
};
