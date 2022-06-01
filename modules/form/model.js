const mongoose = require("mongoose");
const { Schema } = mongoose;

const Model = new Schema(
  {
    invitingPartner: {
      type: Schema.Types.ObjectId,
      ref: "ourPartners",
      required: true,
    },
    companyName: { type: String, required: true },
    fullName: { type: String, required: true },
    linkedIn: {
      type: String,
    },
    companyWebsite: {
      type: String,
    },
    phone: { type: String, required: true },
    email: {
      type: String,
      match:
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      required: true,
    },
    country: { type: String },
    meetId: {
      type: Schema.Types.ObjectId,
      ref: "meetings",
      required: true,
    },
    dateVisited: { type: Date },
    status: {
      type: String,
      default: "registered",
      enum: ["registered", "Not Interested", "Visited", "Interested", "Joined"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

Model.index({ email: 1, meetId: 1 }, { unique: true });

module.exports = mongoose.model("forms", Model);
