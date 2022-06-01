// const { fullTextSearchApi, queryApi } = require("sec-api");
// const moment = require("moment");
// const DocModel = require("../modules/docs/model");

// queryApi.setApiKey(
//   "231504425d4558ed37e01b881a29d3b190ae45dcf679f883977dde70661641a4"
// );

// const getFormData = async (accessionNo) => {
//   const query = {
//     query: {
//       query_string: {
//         query: `accessionNo:\"${accessionNo}\"`,
//       },
//     },
//   };
//   let filings;
//   try {
//     filings = await queryApi.getFilings(query);
//   } catch (error) {
//     return error;
//   }
//   return filings.filings;
// };

// const insertData = async (records, doc) => {
//   try {
//     await DocModel.updateOne({ _id: doc._id }, records);
//   } catch (error) {
//     return error;
//   }
// };

// const getAllData = async () => {
//   let docs;
//   try {
//     docs = await DocModel.find({ companyName: { $eq: null } });
//   } catch (error) {
//     return error;
//   }
//   for (const doc of docs) {
//     const totalRecords = await getFormData(doc.accessionNo);
//     if (totalRecords.length < 1) {
//       console.log(doc._id, doc.accessionNo);
//       continue;
//     }
//     const { companyName, linkToTxt, description } = totalRecords[0];
//     const { fileNo, irsNo, sic, filmNo, stateOfIncorporation } =
//       totalRecords[0].entities[0];

//     try {
//       await insertData(
//         {
//           irsNo,
//           sic,
//           fileNo,
//           filmNo,
//           stateOfIncorporation,
//           companyName,
//           linkToTxt,
//           description,
//         },
//         doc
//       );
//     } catch (error) {
//       console.log(error);
//     }
//   }
// };

// // getAllData();
