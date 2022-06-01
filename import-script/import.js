require("dotenv").config({path : '../.env'});
console.log(process.env.url);
const mysql = require("mysql");
const async = require("async");
const companyController = require("../modules/company/controller");
const serverUtil = require("../utils/serverUtil");

var con = mysql.createConnection({
  host: "localhost",
  user: "mca_scrapper",
  password: "j&R_6t`)%y8cx)8_",
});

serverUtil.boot().then(() => {
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    startUploadingData();
  });
});

async function startUploadingData() {
  console.time('LoopTime');
  con.query(
    `SELECT * FROM mca_scrapper.company_details where is_master_processed=1 and api_response IS NULL and master_details like "%cin%" order by id asc limit 1000`,
    function (err, result) {
      if (err) throw err;
      if (!result.length) {
        return;
      }
      
      async.each(
        result,
        function (row, callback) {
          let companyDetails = { body: JSON.parse(row.master_details).details };
          companyDetails.body.fromNodeScript = true;
          companyController.createCompany(
            companyDetails,
            undefined,
            function (operation) {              
              con.query(
                `UPDATE mca_scrapper.company_details SET api_response='${operation}' WHERE id=${row.id}`
              );
              callback();
            }
          );          
        },
        function (err) {
          console.log("All files have been processed successfully");
          console.timeEnd('LoopTime');
          startUploadingData();
        }
      );
    }
  );
}
