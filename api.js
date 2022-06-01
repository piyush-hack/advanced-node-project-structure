const express = require("express");
const router = express.Router();
const authenticate = require("./middlewares/authenticate");

var handlers = {
  user: {
    path: require("./modules/user"),
  },
  form: {
    path: require("./modules/form"),
  },
  ourPartner: {
    path: require("./modules/ourPartner"),
  },
  meeting: {
    path: require("./modules/meeting"),
  },
};

for (let m in handlers) {
  if (handlers[m].authenticate) {
    router.use("/" + m, authenticate, handlers[m].path);
  } else {
    router.use("/" + m, handlers[m].path);
  }
}

router.use("*", (req, res) => {
  res.send({
    code: 400,
    message: "API not found",
  });
});

module.exports = router;
