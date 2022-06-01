const roles = require("../fixtures/roles");
const Roles = require("../modules/role/model");

module.exports = (app) =>
  new Promise(async (resolve, reject) => {
    for (const role of roles) {
      try {
        const alreadyExistRole = await Roles.findOne({ name: role.name });
        if (alreadyExistRole) {
          await Roles.updateOne(
            { name: role.name },
            {
              $addToSet: {
                modules: role.modules,
              },
            }
          );
        } else {
          await Roles.create(role);
        }
      } catch (e) {
        reject(e);
      }
    }
    resolve();
  });
