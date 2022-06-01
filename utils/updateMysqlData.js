const _ = require("lodash");
var mysql = require("mysql");
const moment = require("moment");
const CompanyModel = require("../modules/company/model");
const DocumentModel = require("../modules/document/model");

const run = async () => {
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Dkod3@123",
    database: "hexabull",
    port: 3306,
  });

  con.connect((err) => {
    if (err) console.log(err);
    console.log("connected");
    const query =
      "SELECT * FROM company_details WHERE public_details IS NOT NULL;";
    con.query(query, async (err, result) => {
      if (err) console.log(err);
      let i = 0;
      console.log(result.length);
      for (const r of result) {
        i += 1;
        console.log(i);
        const company = await CompanyModel.findOne({ companyCIN: r.cin });
        if (!company) {
          const updateQuery = `UPDATE company_details SET companyFound = FALSE WHERE cin = '${r.cin}'`;
          con.query(updateQuery, (err, result) => {
            if (err) console.log(err);
          });
        } else {
          const documents = JSON.parse(r.public_details);
          for (const doc of documents.docs) {
            const data = {
              category: doc.category,
              company: company._id,
            };
            // console.log(JSON.stringify(doc));
            for (const document of doc.documents) {
              if (!_.isEmpty(document.documents)) {
                data.year = document.year;
                for (const d of document.documents) {
                  const date = d["Date Of Filing"].replace(/^\t+/gm, "");
                  const name = d["Document Name\n\t\t\t\t\t"].replace(
                    /^\t+/gm,
                    ""
                  );
                  data.date = date.replace("\n", "");
                  data.name = name.replace("\n", "");
                  try {
                    await DocumentModel.create(data);
                  } catch (error) {
                    console.log(error);
                  }
                  console.log("done");
                }
              }
            }
          }
        }
      }
    });
  });
};

// run();
