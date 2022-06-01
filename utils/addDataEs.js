const axios = require("axios");
const _ = require("lodash");
const DocModel = require("../modules/company/model");

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const getAllData = async () => {
  for (let i = 0; i < 20; i += 10) {
    let docs;
    try {
      docs = await DocModel.find().limit(10).skip(i);
    } catch (error) {
      return error;
    }
    const data = [];
    for (const doc of docs) {
      const directors = doc.directors.map((di) => {
        return { name: di.name.toLowerCase(), dIN: di.dIN.toLowerCase() };
      });
      let cin = doc.companyCIN.replace(/\s/g, "_");
      let companyName = doc.companyName.replace(/\s/g, "_");
      cin = doc.companyCIN.replace(/[^a-zA-Z ]/g, "_");
      companyName = companyName.replace(/[^a-zA-Z ]/g, "_");
      data.push({
        id: doc._id,
        companyCIN: cin.toLowerCase(),
        companyName: companyName.toLowerCase(),
        directors,
      });
    }
    await DocModel.updateMany(
      { _id: { $in: _.map(data, "id") } },
      { parsed: true }
    );
    console.log(data);
    let d = {
      method: "post",
      url: "https://9ca867d30f97413faa72d7f28a6f0196.ent-search.eastus2.azure.elastic-cloud.com/api/as/v1/engines/hexabull-companies-28dec/documents",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer private-89rur4mhszkxoiqomc1qk1h7",
      },
      data: data,
    };
    const res = await axios(d);
    console.log(res.data);

    await sleep(100);
  }
};
// getAllData();
