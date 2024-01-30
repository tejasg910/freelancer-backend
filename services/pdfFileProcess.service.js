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

const pdfProcedure = {
  percentage: 0,
  totalFiles: 0,
};

const createUserFromPdfService = async (files, companyId) => {
  try {
    const user = await User.findOne({
      _id: companyId,
      isDeleted: false,
      userType: "client",
    });

    const filesResult = [];
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
    pdfProcedure.totalFiles = files.length;
    pdfProcedure.remainingFiles = files.length;

    if (files && files.length > 0 && files[0].mimetype == "application/pdf") {
      //uploading the files

      for (let index = 0; index < files.length; index++) {
        const file = files[index];

        const url = await uploadFile(file, "document");

        const getData = await FileService(url);
        // const testRead = await readPDFFromUrl(url);
        // console.log(testRead)
        if (getData.name) {
          if (getData && getData.email != null && getData.name != null) {
            let existingUser = null;
            if (getData.email != "") {
              existingUser = await User.findOne({
                email: getData.email,
                owner: companyId,
                isDeleted: false,
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
                  title: exp.title ? exp.title : "",
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
                title: { $in: getData.skills ? getData.skills : null },
              });
              const designationData = await Designation.find({
                designation: {
                  $in: getData.designation ? getData.designation : null,
                },
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
                availability: 1,
              });

              const err = newUser.validateSync();
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

                filesResult.push({
                  fileName: file.originalname,
                  status: "Added successfully",
                });
              } else {
                filesResult.push({
                  fileName: file.originalname,
                  status: "Something went wrong",
                });
              }
            } else {
              filesResult.push({
                fileName: file.originalname,
                status: "Already exists",
              });
            }
          }
        } else {
          //name not found
          filesResult.push({
            fileName: file.originalname,
            status: "Name not found",
          });
        }

        pdfProcedure.percentage = ((index + 1) * 100) / pdfProcedure.totalFiles;
        pdfProcedure.remainingFiles = pdfProcedure.totalFiles - (index + 1);
      }

      // const result = await Promise.all(users);

      pdfProcedure.percentage = 0;
      pdfProcedure.totalFiles = 0;
      pdfProcedure.remainingFiles = 0;

      return {
        status: 200,
        message: `${resourceCount} resources added successfully`,
        filesResult,
      };
    }

    pdfProcedure.percentage = 0;
    pdfProcedure.totalFiles = 0;
    pdfProcedure.remainingFiles = 0;
    return {
      status: 400,
      message: "Invlaid file format",
    };
  } catch (error) {
    pdfProcedure.percentage = 0;
    pdfProcedure.totalFiles = 0;
    pdfProcedure.remainingFiles = 0;

    console.log("error in pdf extractor", error);
    return {
      status: 500,
      message: "Internal server error ",
    };
  }
};

const getLiveUpdateService = async () => {
  console.log(pdfProcedure);
  return {
    status: 200,

    pdfProcedure,
  };
};

module.exports = {
  FileService,
  createUserFromPdfService,
  getLiveUpdateService,
};
