const Order = require("../modules/orders/model");
const messages = require("../utils/messages")["checkDownload"];
const response = require("../utils/response");
const moment = require("moment");

const checkDownload = async (req, res, next) => {
  let Id = req.params.orderId;
  let userId = req.user._id;

  let order = await Order.findOne({ _id: Id, createdBy: userId });

  if (!order) {
    return response.sendError(res, messages.notAllowed);
  }

  if(!order.file){
    return response.sendError(res, messages.canNotDownload);
  }

  let compareDate = moment();
  compareDate = compareDate.subtract(3, "days").endOf("day").format();
  compareDate = new Date(compareDate).getTime();


  if (order.fileReadyDate.getTime() < compareDate) {
    return response.sendError(res, messages.canNotDownload);
  }

  req.userOrder = order;

  return next();
};

module.exports = checkDownload;
