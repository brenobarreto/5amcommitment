var express = require("express");
var path = require("path");
var favicon = require("static-favicon");
var logger = require("morgan");
var bodyParser = require("body-parser");
var session = require("express-session");
var okta = require("@okta/okta-sdk-nodejs");
var ExpressOIDC = require("@okta/oidc-middleware").ExpressOIDC;

const dashboardRouter = require("./routes/dashboard");
const publicRouter = require("./routes/public");
const usersRouter = require("./routes/users");

var app = express();
var oktaClient = new okta.Client({
  orgUrl: "https://dev-917669.okta.com",
  token: "007iN6koXGErqvLRrP6r-9jphHY_-6JEVP0W992klV"
});
const oidc = new ExpressOIDC({
  issuer: "https://dev-917669.okta.com/oauth2/default",
  client_id: "0oa2ceo14JhX7Gx9v4x6",
  client_secret: "cC0JiOM4F8zAngs0sODd3-3rUNRy8bE5KRrbWTzY",
  redirect_uri: "http://localhost:3002/users/callback",
  scope: "openid profile",
  routes: {
    login: {
      path: "/users/login"
    },
    callback: {
      path: "/users/callback",
      defaultRedirect: "/dashboard"
    }
  }
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(favicon());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "lsdbhvsdbvlsdbvlsdbvlslbvlshbvlsudvbbsudvblsdkvblsdkbv",
    resave: true,
    saveUninitialized: false
  })
);
app.use(
  session({
    secret: "asdf;lkjh3lkjh235l23h5l235kjh",
    resave: true,
    saveUninitialized: false
  })
);
app.use(oidc.router);

app.use((req, res, next) => {
  if (!req.userinfo) {
    return next();
  }

  oktaClient
    .getUser(req.userinfo.sub)
    .then(user => {
      req.user = user;
      res.locals.user = user;
      next();
    })
    .catch(err => {
      next(err);
    });
});

function loginRequired(req, res, next) {
  if (!req.user) {
    return res.status(401).render("unauthenticated");
  }

  next();
}

app.use("/", publicRouter);
app.use("/dashboard", loginRequired, dashboardRouter);
app.use('/users', usersRouter);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {}
  });
});

module.exports = app;
