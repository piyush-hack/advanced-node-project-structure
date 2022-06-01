var XLSX = require("xlsx");
var fs = require("fs");
const path = require("path");


const exportToExcel = (data, res, fileName) => {
  var dir = path.resolve("./exports");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  let header = Object.keys(data[0]);
  var ws = XLSX.utils.json_to_sheet(data, header);

  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  var filePath = dir + "/" + fileName + Date.now() + ".xlsx";
  var filename = fileName + Date.now() + ".xlsx";
  XLSX.writeFile(wb, filePath);
  res.setHeader("Content-disposition", "attachment; filename=" + filename);
  res.status(200).sendFile(path.resolve(filePath));
};

module.exports = {
  exportToExcel,
}