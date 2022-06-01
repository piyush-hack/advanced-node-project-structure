const mongoose = require("mongoose");
const { Schema } = mongoose;

const Model = new Schema(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("meetings", Model);
