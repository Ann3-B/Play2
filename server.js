var path = require('path'),
    express = require('express'),
    nunjucks = require('express-nunjucks'),
    routes = require(__dirname + '/app/routes.js'),
    favicon = require('serve-favicon'),
    app = express(),
    basicAuth = require('basic-auth'),
    bodyParser = require('body-parser'),
    config = require(__dirname + '/app/config.js'),
    port = (process.env.PORT || config.port),
    utils = require(__dirname + '/lib/utils.js'),
    packageJson = require(__dirname + '/package.json'),
    session = require('express-session');

// Grab environment variables specified in Procfile or as Heroku config vars
    releaseVersion = packageJson.version;
    username = process.env.USERNAME,
    password = process.env.PASSWORD,
    env      = process.env.NODE_ENV || 'development',
    useAuth  = process.env.USE_AUTH || config.useAuth;

    env      = env.toLowerCase();
    useAuth  = useAuth.toLowerCase();

// Authenticate against the environment-provided credentials, if running
// the app in production (Heroku, effectively)
if (env === 'production' && useAuth === 'true'){
    app.use(utils.basicAuth(username, password));
}

// Application settings
app.set('view engine', 'html');
app.set('views', [__dirname + '/app/views', __dirname + '/lib/']);

nunjucks.setup({
  autoescape: true,
  watch: true,
  noCache: true
}, app);

// Middleware to serve static assets
app.use('/public', express.static(__dirname + '/public'));
app.use('/public', express.static(__dirname + '/govuk_modules/govuk_template/assets'));
app.use('/public', express.static(__dirname + '/govuk_modules/govuk_frontend_toolkit'));
app.use('/public/images/icons', express.static(__dirname + '/govuk_modules/govuk_frontend_toolkit/images'));

// Elements refers to icon folder instead of images folder
app.use(favicon(path.join(__dirname, 'govuk_modules', 'govuk_template', 'assets', 'images','favicon.ico')));

// Support for parsing data in POSTs
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Support for session
app.use(session({
  secret: "prototype-kit",
  resave: false,
  saveUninitialized: false
}));

<<<<<<< HEAD
app.use(function (req, res, next) {

  // store any data sent in session

  if (!req.session.data){
    req.session.data = {};
  }

  for (var i in req.body){
    req.session.data[i] = req.body[i];
  }

  // send session data to all views

  if (!res.locals.data){
    res.locals.data = {};
  }

  for (var i in req.session.data){
    res.locals.data[i] = req.session.data[i];
  }

  // send assetPath to all views
  res.locals.asset_path="/public/";

  // Add variables that are available in all views
  res.locals.serviceName=config.serviceName;
  res.locals.cookieText=config.cookieText;
  res.locals.releaseVersion="v" + releaseVersion;

  next();

});

app.use(utils.autoStoreData);
app.use(utils.commonData);

// routes (found in app/routes.js)
if (typeof(routes) != "function"){
  console.log(routes.bind);
  console.log("Warning: the use of bind in routes is deprecated - please check the prototype kit documentation for writing routes.")
  routes.bind(app);
} else {
  app.use("/", routes);
}

app.get('/_/clear-data', function(req, res){

  req.session.data = {};

  res.render("_/clear-data");

});

app.get(/^\/([^.]+)$/, utils.autoroute);

// redirect all POSTs to GETs to avoid nasty refresh warning
app.post(/^\/([^.]+)$/, function(req, res){
  res.redirect("/" + req.params[0]);
});

console.log("\nGOV.UK Prototype kit v" + releaseVersion);
// Display warning not to use kit for production services.
console.log("\nNOTICE: the kit is for building prototypes, do not use it for production services.");

// start the app
utils.findAvailablePort(app);
