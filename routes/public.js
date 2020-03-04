const express = require("express");
const router = express.Router();
const { data } = require("../data/q&a.json");
const { sets } = data;
var bodyParser = require("body-parser");
const https = require("https");
const request = require("request");
var stringify = require('js-stringify');


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

//Turns the day into the index so every new day shows a different question from q&a.json
let today = new Date();
let i = today.getDate();

//Points assembling logic
function getPoints() {
  let points;
  let h = today.getHours();
  let m = today.getMinutes();

  if (h >= 8) {
    points = 0;
  } else if (h == 7 && m >= 30) {
    points = 10;
  } else if (h == 7 && m < 30) {
    points = 20;
  } else if (h == 6 && m >= 30) {
    points = 30;
  } else if (h == 6 && m < 30) {
    points = 45;
  } else if (h == 5 && m >= 30) {
    points = 60;
  } else if (h == 5 && m < 30 && m >= 5) {
    points = 80;
  } else if (h == 5 && m < 5) {
    points = 100;
  } else {
    //This is before 5am
    points = 0;
  }

  return points;
}

const options = {
  host: "https://dev-917669.okta.com",
  port: 443,
  path: "/api/v1/users",
  method: "GET",
  headers: {
    "content-type": "application/json",
    accept: "application/json",
    Authorization: "SSWS 007iN6koXGErqvLRrP6r-9jphHY_-6JEVP0W992klV"
  }
};

var usersList = "";
var usersHtml = `ul(class=scoreboard)`;
var usersObj = {};

//Get users through Okta API
request(
  {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "SSWS 007iN6koXGErqvLRrP6r-9jphHY_-6JEVP0W992klV"
    },
    uri: "https://dev-917669.okta.com/api/v1/users",
    method: "GET"
  },
  (err, res, body) => {
    let unorderedBody = JSON.parse(body);
    
    function displayUsers(users) {
      var i = 0;
      users.forEach(u => {
        usersObj[i] = {
          user:  u.profile.firstName,
          points: u.profile.points
        }
        i++;
        // usersList += "<p>" + "User: " + u.profile.firstName + "  |  Points: " + u.profile.points + "</p>";
        // usersHtml += `
        //   ${u.profile.firstName}: ${u.profile.points}`;
      });
    }

    orderedBody = unorderedBody.sort((x, y) => {
      return y.profile.points - x.profile.points;
    });

    displayUsers(orderedBody);
    console.log(usersHtml);
    console.log(usersObj);

  }
);

// Home page
router.get("/", (req, res) => {
  if (req.user) {
    res.render("index", {
      question: sets[i].question,
      answer: sets[i].answer,
      "scoreBoard": `User: ${JSON.stringify(usersObj, undefined, 2)}`
    });
  } else {
    res.render("unauthenticated");
  }
});

//What happens with the form submit
router.post("/", (req, res) => {
  if (req.body.userAnswer == sets[i].answer) {
    console.log("Right answer");
    let points = getPoints();
    console.log(points);
    res.redirect("/goodmorning/?points=" + points);
  } else {
    console.log("Wrong answer");
    res.redirect("/");
  }
});

module.exports = router;
