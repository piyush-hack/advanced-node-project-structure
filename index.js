require("dotenv").config();
var mongoose = require("mongoose");
var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var cors = require("cors");
var path = require("path");

var api = require("./api");
var config = require("./config");

const serverUtils = require("./utils/serverUtil");

var app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, "./dist")));
app.use("/uploads", express.static("uploads", { maxAge: 31536000 }));
app.use("/mailhtml", express.static("mailhtml", { maxAge: 31536000 }));

const PORT = process.env.PORT || 4000;

const startApp = async () => {
  //Middlewares
  app.use(bodyParser.json());
  app.use(cookieParser());

  //Routes
  app.use("/api", api);
  // require("./utils/sec-api");
  // require("./utils/addDataToES");
  // require("./utils/addFieldsInSecData");
  // require("./utils/updateMysqlData");
  // require("./utils/updateDoc");

  //Scripts

  app.listen(PORT, () => {
    console.log(`Welcome to CBBC-TP ${PORT}`);
  });

  app.use("*", (req, res) => {
    return res.sendFile(path.join(__dirname, "./dist/index.html"));
  });
};

serverUtils.boot(app).then(
  () => {
    console.log("Starting index.js - starting app from last else");
    startApp();
  },
  (err) => {
    console.error(err);
  }
);
