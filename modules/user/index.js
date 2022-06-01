const { Router } = require("express");
const controller = require("./controller");
const authenticate = require("../../middlewares/authenticate");
const hasAccess = require("../../middlewares/hasAccess");
const host = require("../../middlewares/host");
const { body } = require("express-validator");
const router = new Router();


router.post("/signup", host, (req, res) => {
  let data = {
    body: req.body,
    hostUrl: req.hostUrl,
  };
  controller.signUp(data, res);
});


router.post("/resendVerification", host, (req, res) => {
  let data = {
    body: req.body,
    hostUrl: req.hostUrl,
  };
  controller.resendVerification(data, res);
});


router.get("/verify/:verificationKey", (req, res) => {
  let data = {
    params: req.params,
  };
  controller.verify(data, res);
});

router.post("/forgotPassword", host, (req, res) => {
  let data = {
    body: req.body,
  };
  controller.forgotPassword(data, res);
});


router.post("/changePassword/:_id", host, (req, res) => {
  let data = {
    params: req.params,
    body: req.body,
  };
  controller.changePassword(data, res);
});

router.post("/login", (req, res) => {
  let data = {
    body: req.body,
  };
  controller.login(data, res);
});


router.put("/", authenticate, (req, res) => {
  let data = {
    params: req.user,
    body: req.body,
  };
  controller.edit(data, res);
});

router.get("/profile", authenticate, (req, res) => {
  let data = {
    user: req.user,
  };
  controller.profile(data, res);
});

router.get("/:_id?", authenticate, (req, res) => {
  let data = {
    params: req.params,
    query: req.query,
    user: req.user,
  };
  controller.getUsers(data, res);
});


module.exports = router;
