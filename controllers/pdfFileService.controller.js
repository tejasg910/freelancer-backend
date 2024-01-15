const { FileService } = require("../services/pdfFileProcess.service");
const { uploadFile } = require("../utils/awsUpload");

const Pdf_to_Detail_Json = async (req, res) => {

    const files = req.files;
    // console.log(files[0])
    // let files = req.files;


    if (files && files.length > 0 && files[0].mimetype == "application/pdf") {
        // Assuming you have an uploadFile function
        let url = await uploadFile(files[0]);
        // let url = files[0]

        // console.log(url);
        return res.status(200).json({ data: url })
    }

    // const response = await FileService({})
    // res.status(response.status).json({
    //     ...response
    // })
    return res.status(400).json({ errors: "Invalid file format" })

}


module.exports = {
    Pdf_to_Detail_Json
}
