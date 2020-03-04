const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  let points = parseInt(req.query.points);
  if (req.user.points == undefined ) { req.user.points = 0 };
  req.user.points += points;
  res.render("goodmorning", {
    points: points
  });
  console.log(req.user.points);
});

module.exports = router;
