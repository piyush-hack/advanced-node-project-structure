const mongoose = require("mongoose");
const { Schema } = mongoose;

const address = new Schema({
  _id: false,
  line1: {
    type: String,
  },
  line2: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
  },
  postCode: {
    type: String,
  },
});


const UserModel = new Schema(
  {
    name: {
      type: String,
      // required: true,
    },
    firstName: String, 
    lastName: String,
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      match:
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "roles",
    },
    isVerified: { type: Boolean, default: false },
    verificationKey: { type: Schema.Types.ObjectId },
    address: { type: address }, //hexanomy
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("users", UserModel);
