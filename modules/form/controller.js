const Model = require("./model");
const response = require("../../utils/response");
const messages = require("../../utils/messages");
const pagination = require("../../config")["pagination"];
const common = require("../../utils/common");
const config = require("../../config");
const excel = require("../../utils/exportToExcel");

class docsController {
  async create(data, res) {
    let form;
    try {
      form = await Model.findOne({
        email: data.body.email,
        meetId: data.body.meetId,
      });

      if (form) {
        return response.sendError(res, messages.form.form_exists);
      }

      form = await Model.create({
        ...data.body,
      });
    } catch (err) {
      console.log(err);
      return response.sendSystemError(res, err);
    }
    return response.sendSuccess(res, messages.created, form);
  }

  async edit(data, res) {
    try {
      let body = data.body;

      let form;

      form = await Model.findOneAndUpdate(
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
      return response.sendSuccess(res, messages.edited, form);
    } catch (err) {
      return response.sendSystemError(res, err);
    }
  }

  async select(data, res) {
    try {
      let records, meta;

      if (data.params._id) {
        records = await Model.findOne(data.params).populate(
          "invitingPartner meetId"
        );
        return response.sendSuccess(res, messages.retrive, records, meta);
      } else {
        let skip = 0;
        let page = parseInt(data.query.page) || 1;
        let limit = parseInt(data.query.limit) || pagination.size;
        let exportRecords = data.query.export || "false";
        skip = (page - 1) * limit;
        delete data.query.export;
        delete data.query.page;
        delete data.query.limit;
        let sort = -1;
        let sortBy = data.query.sortBy || "_id";
        delete data.query.sortBy;

        if (data.query.dateVisited) {
          data.query.dateVisited = new Date(data.query.dateVisited);
        }

        if (data.query.fullName) {
          data.query.fullName = {
            $regex: new RegExp(
              data.query.fullName.toLowerCase().replace(/\s+/g, "\\s+"),
              "gi"
            ),
          };
        }

        if (exportRecords == "true") {
          try {
            records = await Model.find(data.query)
              .sort({ [sortBy]: sort })
              .populate("invitingPartner meetId");
            let excelData = [];
            let exportKeys = {
              fullName: 1,
              email: 1,
              companyName: 1,
              status: 1,
              country: 1,
              companyWebsite: 1,
              linkedIn: 1,
              dateVisited: 1,
            };

            await records.forEach(async (element) => {
              let excelDataEntry = {};
              for (const key in exportKeys) {
                if (element[key]) {
                  excelDataEntry[key] = element[key].toString();
                }
              }
              if (element && element.meetId && element.meetId.date) {
                excelDataEntry["registeredFor"] =
                  element.meetId.date.toString();
              }
              if (
                element &&
                element.invitingPartner &&
                element.invitingPartner.firstName
              ) {
                excelDataEntry["invitingPartnerName"] =
                  element.invitingPartner.firstName;
              }
              excelData.push(excelDataEntry);
            });

            // console.log(excelData)
            await excel.exportToExcel(excelData, res, "from");
          } catch (error) {
            return response.sendSystemError(res, err);
          }
        } else {
          records = await Model.find(data.query)
            .sort({ [sortBy]: sort })
            .skip(skip)
            .limit(limit)
            .populate("invitingPartner meetId");

          if (page == 1) {
            meta = {
              currentPage: page,
              recordsPerPage: limit,
              totalRecords: await Model.find(data.query).countDocuments(),
            };
            meta.totalPages = Math.ceil(
              meta.totalRecords / meta.recordsPerPage
            );
          }
          return response.sendSuccess(res, messages.retrive, records, meta);
        }
      }
    } catch (err) {
      return response.sendSystemError(res, err);
    }
  }

  async count(req, res) {
    try {
      let records, meta;

      let data = {};
      records = await Model.find({})
        .select("status dateVisited meetId")
        .populate({ path: "meetId", select: "name date" });

      data.peopleRegistered = await Model.find({}).countDocuments();

      data.peopleAttended = await Model.find({
        status: "visited",
      }).countDocuments();

      let today = new Date();


      data.upcomingRegistrations = await Model.aggregate([
        {
          $lookup: {
            from: "meetings",
            let: {
              mId: "$meetId",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$mId"] },
                      { $gte: [today , "$date" ] },
                    ],
                  },
                },
              },
            ],
            as: "meetId",
          },
        },
        {
          $match: {
            $expr: {  $eq: ["$meetId", [] ] },
          },
        },
      ])

      console.log(data.upcomingRegistrations)
      data.upcomingRegistrations = Object.keys(data.upcomingRegistrations).length

      records = await Model.aggregate([
        {
          $lookup: {
            from: "meetings",
            localField: "meetId",
            foreignField: "_id",
            as: "meetId",
          },
        },
        {
          $group: {
            _id: "$meetId",
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]);

      data.meets = records;

      return response.sendSuccess(res, messages.retrive, data, meta);
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
