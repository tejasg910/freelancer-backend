const mongoose = require("mongoose");
const axios = require("axios");
// const natural = require("natural");
// const PDFParser  = require("pdf-parse");

const { User, Category, Designation } = require("../models");
const { uploadFile } = require("../utils/awsUpload");
const { setNotification } = require("./notification.service");

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

// const tokenizer = new natural.WordTokenizer();

// const parsePDFContentForExperiences = async (pdfContent) => {
//   const experiencePatterns = [
//     /(?:^|\n)(?<title>[\w\s]+)\s+at\s+(?<company>[\w\s]+)\s+from\s+(?<startDate>[\d-]+)\s+to\s+(?<endDate>[\d-]+)/g,
//     // Add more patterns if needed
//   ];

//   const experiences = [];

//   experiencePatterns.forEach((pattern) => {
//     let match;
//     while ((match = pattern.exec(pdfContent)) !== null) {
//       const { title, company, startDate, endDate } = match.groups;

//       // Extract summary for each experience
//       const summary = extractSummary(pdfContent, match.index, pattern.lastIndex);

//       experiences.push({
//         title: title.trim(),
//         company: company.trim(),
//         startDate: startDate.trim(),
//         endDate: endDate.trim(),
//         summary: summary.trim(),
//       });
//     }
//   });

//   return experiences;
// };

// const extractSummary = (pdfContent, startIndex, endIndex) => {
//   const contextLength = 100; // Number of characters to include before and after the matched pattern
//   const start = Math.max(0, startIndex - contextLength);
//   const end = Math.min(pdfContent.length, endIndex + contextLength);

//   const context = pdfContent.substring(start, end);

//   // Use Natural library for tokenization
//   const tokens = tokenizer.tokenize(context);

//   // Limit the summary to a certain number of words
//   const summaryLength = 30;
//   const summaryTokens = tokens.slice(Math.max(0, tokens.length - summaryLength));

//   return summaryTokens.join(' ');
// };

// const readPDFFromUrl = async (pdfUrl) => {
//   try {
//     const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
//     const buffer = Buffer.from(response.data, 'binary');
//     const pdfData = await PDFParser(buffer);
//     return pdfData.text;
//   } catch (error) {
//     console.error('Error reading PDF from URL:', error);
//     throw error; // Handle the error appropriately based on your application's requirements
//   }
// };

const createUserFromPdfService = async (files, companyId) => {
  try {
    const user = await User.findById(companyId);
    const processedResources = [];
    const existedResources = [];
    const fillEmail = [];
    let resourceCount = 0;
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
      const users = await files.map(async (file) => {
        const url = await uploadFile(file, "document");
        const getData = await FileService(url);
        // const testRead = await readPDFFromUrl(url);
        // console.log(testRead)
        console.log(getData, "getdata");
        if (getData && getData.email != null && getData.name != null) {
          let existingUser = null;
          if (getData.email != "") {
            existingUser = await User.findOne({
              email: getData.email,
              owner: companyId,
            });
          }

          if (!existingUser) {
            //
            let totalExperience = 0;
            const { experience } = getData;

            const experiences = await experience.map((exp) => {
              totalExperience += exp.amount_of_experience
                ? exp.amount_of_experience
                : 0;
              return {
                title: exp.title.length > 0 ? exp.title[0] : "",
                duration_string: exp.duration_string
                  ? exp.duration_string
                  : "0 years",
                duration_number: exp.amount_of_experience
                  ? exp.amount_of_experience
                  : 0,
                summary: exp.summary ? exp.summary : "",
              };
            });
            const skillsData = await Category.find({
              _id: { $in: getData.skills ? getData.skills : null },
            });
            console.log(skillsData, "skillsdata");
            const designationData = await Designation.find({
              _id: { $in: getData.designation ? getData.designation : null },
            });

            const skillsId = skillsData.map((skill) => skill._id);

            const newSkills = skillsId.filter(
              (skillId) => !user.skills.includes(skillId)
            );

            const designationIds = designationData.map(
              (designation) => designation._id
            );

            const newUser = new User({
              email: getData.email ? getData.email : "",
              designation: designationIds,
              totalExperience: totalExperience,
              experience: experiences,
              fullName: getData.name ? getData.name : "",
              briefExperience: getData.work_experience
                ? getData.work_experience
                : "",
              phoneNumber: getData.phone ? getData.phone : "",
              skills: skillsId,
              userType: "user",
              owner: companyId,
              resume: url,
              budget: 0,
              availability: "Immediate",
            });

            const err = newUser.validateSync();
            console.log(err, "err");
            if (!err) {
              const newUserSave = await newUser.save();

              resumes.push(newUserSave.resume);
              team.push(newUserSave._id);

              if (newSkills.length > 0) {
                skills.push(...newSkills);
              }

              const updatedUser = await User.findByIdAndUpdate(companyId, {
                resumes,
                team,
                skills,
              });

              resourceCount += 1;
              processedResources.push(`${newUser.fullName} added successfully`);
              fillEmail.push(`Fill email of ${newUserSave.fullName}`);

              //sending notification
              // const allCompanies = await User.find({
              //   _id: { $ne: mongoose.Types.ObjectId(companyId) },
              //   userType: "client",
              // });

              // allCompanies.forEach(async (user) => {
              //   const switchObj = {
              //     notificationType: "resourcePosted",
              //     // notificationMessage: `"${user?.project?.projectTitle}" posted by  ${user?.user?.fullName}`,
              //     notificationMessage: `${newUserSave?.fullName}`,

              //     responseMessage: "resource posted",
              //   };
              //   const notification = await setNotification({
              //     triggeredBy: companyId,
              //     notify: user?._id,
              //     notificationMessage: switchObj.notificationMessage,
              //     resourceId: newUserSave?._id,
              //     notificationType: switchObj?.notificationType,
              //   });
              // });
            }
          } else {
            existedResources.push(`${existingUser?.fullName} already exists`);
          }
        }
      });

      const result = await Promise.all(users);
      return {
        status: 200,
        message: `${resourceCount} resources added successfully`,
        resources: processedResources,
        existing: existedResources,
        emailRequired: fillEmail,
      };
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
