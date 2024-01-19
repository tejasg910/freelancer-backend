const axios = require("axios");
const { User, Category } = require("../models");
const { uploadFile } = require("../utils/awsUpload");

async function FileService(url) {
  try {
    const formData = new FormData();
    formData.append("pdf_url", url);

    const getJson = await axios.post(process.env.PDF_LINK_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return getJson.data;
  } catch (error) {
    console.error(error);
  }
}

const createUserFromPdfService = async (files, companyId) => {
  try {
    const user = await User.findById(companyId);
    if (!user) {
      return {
        status: 404,
        message: "No company found",
      };
    }

    const team = user.team;
    const resumes = user.resumes;
    const skills = user.skills;
    if (!user) {
      return {
        status: 404,
        message: "No company found",
      };
    }

    // let files = req.files;

    if (files && files.length > 0 && files[0].mimetype == "application/pdf") {
      //uploading the files
      console.log(files, "files");
      const users = await files.map(async (file) => {
        const url = await uploadFile(file, "document");
        const getData = await FileService(url);
        const existingUser = await User.findOne({
          email: getData.email,
        });

        if (!existingUser) {
          if (getData.email) {
            const skillsData = await Category.find({
              title: { $in: getData?.skills },
            });
            const skillsId = skillsData.map((skill) => skill._id);

            const newSkills = skillsId.filter(
              (skillId) => !user.skills.includes(skillId)
            );

            const newUser = new User({
              email: getData?.email,
              fullName: getData?.name,

              phoneNumber: getData?.phone,
              skills: skillsId,
              userType: "user",
              owner: companyId,
              resume: url,
            });

            const err = newUser.validateSync();
            if (!err) {
              const newUserSave = await newUser.save();
              resumes.push(newUserSave.resume);
              team.push(newUserSave._id);

              if (newSkills.length > 0) {
                skills.push(...newSkills);
              }

              await User.findByIdAndUpdate(companyId, {
                resumes,
                team,
                skills,
              });
            }
          }
        }
        // Assuming you have an uploadFile function
      });

      const result = await Promise.all(users);
      return { status: 200, message: "Team added successfully" };
    }

    return {
      status: 400,
      message: "Invlaid file format",
    };
  } catch (error) {
    console.log("error in pdf extractor", error);
    return {
      status: 500,
      message: "Internal server error ",
    };
  }
};

module.exports = { FileService, createUserFromPdfService };
