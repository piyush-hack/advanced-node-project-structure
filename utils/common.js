var mongoose = require("mongoose");

checkKeys = (data, keys) => {
  for (let key of keys) {
    if (data[key] == undefined || data[key] == "" || data[key] == null) {
      return false;
    }
  }
  return true;
};

filterObj = (data, keys) => {
  var obj = {};
  for (let key of keys) {
    if (data[key]) obj[key] = data[key];
  }
  return obj;
};


module.exports = {
  checkKeys,
  filterObj,
};
