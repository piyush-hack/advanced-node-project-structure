const { Router } = require("express");
const controller = require("./controller");
const authenticate = require("../../middlewares/authenticate");
const hasAccess = require("../../middlewares/hasAccess");
const router = new Router();

router.post("/",
  authenticate,
  (req, res) => {
    let data = {
      body: req.body,
      user: req.user,
    };
    controller.create(data, res);
  });

router.put("/:_id",
  authenticate,
  (req, res, next) => {
    let data = {
      body: req.body,
      params: req.params,
    };
    controller.edit(data, res);
  });


// api to get all  data
router.get('/:_id?',
  (req, res) => {
    let data = {
      params: req.params,
      query: req.query,
    };
    controller.select(data, res);
  });

// api to delete  data
router.delete('/:_id',
  authenticate,
  (req, res) => {
    let data = {
      params: req.params,
      query: req.query,
    };
    controller.delete(data, res);
  });



module.exports = router;
