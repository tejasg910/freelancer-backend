const { Qualification } = require('../models');

async function QualificationsController(req, res, next) {
    try {

        const getQualifications = await Qualification.find({ isDeleted: false })
        return res.status(200).json({ message: "success", getQualifications })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}


module.exports = QualificationsController