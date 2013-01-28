/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    hbs = require('hbs'),
    mongoose = require('mongoose');

var app = express();
hbs.registerPartial('header', fs.readFileSync(__dirname + '/views/header.hbs', 'utf8'));
hbs.registerPartial('menu', fs.readFileSync(__dirname + '/views/menu.hbs', 'utf8'));
hbs.registerPartial('footer', fs.readFileSync(__dirname + '/views/footer.hbs', 'utf8'));

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'hbs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

mongoose.connect('mongodb://localhost/theresaSite');

var CommandSchema = new mongoose.Schema({
    title: String,
    description: String,
    example: String
});

var Commands = mongoose.model('Commands', CommandSchema);

app.get('/', function (req, res) {
    res.render('index.hbs');
});

app.get('/download', function (req, res) {
    Commands.find({}, function (err, docs) {
        res.render('download.hbs');
    });
});

app.get('/getting-started', function (req, res) {
    Commands.find({}, function (err, docs) {
        res.render('getting-started.hbs');
    });
});

app.get('/reference', function (req, res) {
    Commands.find({}, function (err, docs) {
        res.render('reference.hbs', {commands: docs});
    });
});

app.get('/reference/:command', function (req, res) {
    Commands.find({title: req.params.command}, function (err, docs) {
        res.render('reference.hbs', {commands: docs});
    });
})

app.get('/examples', function (req, res) {
    Commands.find({}, function (err, docs) {
        res.render('examples.hbs');
    });
});

app.get('/examples/effects', function (req, res) {
    Commands.find({}, function (err, docs) {
        res.render('effects.hbs');
    });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
