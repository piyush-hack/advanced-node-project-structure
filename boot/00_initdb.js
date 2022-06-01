const mongoose = require("mongoose");
const config = require("../config");
const Promise = require("bluebird");
const encryption = require("../utils/encryption");
const defaultAdmins = [
  {
    password: "123456",
    isVerified: true,
    email: "admin@cbbc.com",
    role: "admin",
  },
  {
    password: "123456",
    isVerified: true,
    email: "user@cbbc.com",
    role: "user",
  }
];

module.exports = (app) =>
  new Promise(async (resolve, reject) => {
    console.log("Boot script - Starting initdb");
    try {
      await mongoose.connect(config.mongo.url, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        autoIndex: true,
        keepAlive: true,
      });
    } catch (error) {
      reject(error);
    }
    console.log("Boot script - initializing default_admin");
    // eslint-disable-next-line global-require
    const UserModel = require("../modules/user/model");
    const RoleModel = require("../modules/role/model");
    for (const defaultAdmin of defaultAdmins) {
      defaultAdmin.password = await encryption.hashPasswordUsingBcrypt(
        defaultAdmin.password
      );
      try {
        const alreadyExistEngineer = await UserModel.findOne(
          { email: defaultAdmin.email },
          {},
          {}
        );
        if (alreadyExistEngineer) continue;
      } catch (e) {
        return reject(e);
      }
      if (defaultAdmin.role) {
        let role = await RoleModel.findOne({ name: defaultAdmin.role });
        if (role) {
          defaultAdmin.role = role._id;
        } else {
          delete defaultAdmin.role;
        }
      }
      try {
        await UserModel.create(defaultAdmin);
      } catch (e) {
        return reject(e);
      }
    }
    console.log("Boot script - resolving init db");

    resolve();
  });
