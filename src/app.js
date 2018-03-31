import express from 'express'
import cors from 'cors'
import path from 'path'
// var favicon = require('serve-favicon');
// const logger = require('logger')
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import passport from 'passport'

// async await with babel
import "regenerator-runtime/runtime"

// DotENV, automatically loads environment variables from .env folder in the root of this project. If there does not exist one, create one with each key-value pair like NODE_ENV=local in each line.
require('dotenv').config();

// [SH] Bring in the data model
require('./api/models/db');
// [SH] Bring in the Passport config after model is defined
require('./api/config/passport');
// Bring in cron jobs
require('./api/cron/cron');

// [SH] Bring in the routes for the API (delete the default routes)
var routesApi = require('./api/routes/index');

var app = express();
var port = process.env.PORT || 3000;

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
// app.use(logger('dev'));
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
// // [SH] Set the app_client folder to serve static resources
// app.use(express.static(path.join(__dirname, 'app_client')));

// [SH] Initialise Passport before using the route middleware
app.use(passport.initialize());

var options = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Origin', 'Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}
app.use(cors(options));
routesApi.all('*', cors(options));
// [SH] Use the API routes when path starts with /api
app.use('/api', routesApi);

// // [SH] Otherwise render the index.html page for the Angular SPA
// // [SH] This means we don't have to map all of the SPA routes in Express
// app.use(function (req, res) {
//     res.sendFile(path.join(__dirname, 'app_client', 'index.html'));
// });

// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

app.get('/', function (req, res, next) {
    res.status(200).json({
        message: "JOHN ARE U IN"
    });
    next();
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// [SH] Catch unauthorized errors
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401);
        res.json({ "message": err.name + ": " + err.message });
    }
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


let server = app.listen(port, function() {
    console.log('API Server started on: ' + port);
})

server.stop = function() {
    server.close();
}

export default server;
