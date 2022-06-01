const mongoose = require('mongoose');
const { Schema } = mongoose;

const role = new Schema({
    name : {
      type : String,
      required : true
    },
    modules: [{
        type: String,
    }]
});
  
module.exports = mongoose.model('roles', role);
  