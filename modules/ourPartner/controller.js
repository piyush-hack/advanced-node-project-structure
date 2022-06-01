const Model = require("./model");
const response = require("../../utils/response");
const messages = require("../../utils/messages");
const pagination = require("../../config")["pagination"];
const common = require("../../utils/common");
const config = require("../../config");

class docsController {
  async create(data, res) {

    let partner ;
    try {
      partner = await Model.create({
        ...data.body
      });
    } catch (err) {
      console.log(err)
      return response.sendSystemError(res, err);
    }
    return response.sendSuccess(res, messages.created, partner);
  }

  async edit(data, res) {
    try {
      let body = data.body;

      let partner;
      partner = await Model.findOneAndUpdate(
        {
          _id: data.params._id,
        },
        {
          $set: body,
        },
        {
          new: true,
        }
      );
      return response.sendSuccess(res, messages.edited, partner);
    } catch (err) {
      return response.sendSystemError(res, err);
    }
  }

  async select(data, res) {
    try {
      let records, meta;

      if (data.params._id) {
        records = await Model.findOne(data.params);
      } else {
        let skip = 0;
        let page = parseInt(data.query.page) || 1;
        let limit = parseInt(data.query.limit) || pagination.size;
        skip = (page - 1) * limit;
        delete data.query.page;
        delete data.query.limit;
        let sort = -1;
        let sortBy = data.query.sortBy || "_id";
        delete data.query.sortBy;

        records = await Model.find(data.query)
          .sort({ [sortBy]: sort })
          .skip(skip)
          .limit(limit);

        if (page == 1) {
          meta = {
            currentPage: page,
            recordsPerPage: limit,
            totalRecords: await Model.find(data.query).countDocuments(),
          };
          meta.totalPages = Math.ceil(meta.totalRecords / meta.recordsPerPage);
        }
      }
      return response.sendSuccess(res, messages.retrive, records, meta);
    } catch (err) {
      console.log(err);
      return response.sendSystemError(res, err);
    }
  }

  async delete(data, res) {
    try {
      let records, meta;
      records = await Model.findOneAndDelete(data.params);
      response.sendSuccess(res, messages.retrive, records, meta);
    } catch (err) {
      console.log(err);
      return response.sendSystemError(res, err);
    }
  }

}

module.exports = new docsController();
