const mongoose = require('mongoose')



const qualificationSchema = new mongoose.Schema({
    degree: { type: String },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true })


module.exports = mongoose.model('qualification', qualificationSchema);