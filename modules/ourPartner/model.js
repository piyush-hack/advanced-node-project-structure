const mongoose = require("mongoose");
const { Schema } = mongoose;

const Model = new Schema(
  {
    country: { type: String, required: true },
    firstName: { type: String, required: true },
    surName: { type: String, required: true },
    town: { type: String, required: true  },
    website: { type: String },
    email: {
      type: String,
      match:
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, required: true 
    },
    linkedIn: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("ourPartners", Model);
