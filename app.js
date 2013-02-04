/*
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    hbs = require('hbs'),
    mongodb = require('mongodb'),
    app = express();

hbs.registerPartial('header', fs.readFileSync(__dirname + '/views/header.hbs', 'utf8'));
hbs.registerPartial('title-home', fs.readFileSync(__dirname + '/views/title-home.hbs', 'utf8'));
hbs.registerPartial('title-mini', fs.readFileSync(__dirname + '/views/title-mini.hbs', 'utf8'));
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

var server = new mongodb.Server('localhost', 27017, {});
var db = mongodb.Db('theresaSite', server, {});

app.get('/', function (req, res) {
    res.render('index.hbs');
});

app.get('/download', function (req, res) {
    res.render('download.hbs', {quote:
                {link: 'http://www.youtube.com/watch?v=T5jHO4jMPxA',
                 words:'Position yourself on another man\'s cruise. One to share, the other to choose.'}
               });
});

app.get('/getting-started', function (req, res) {
    res.render('getting-started.hbs', {quote:
                {link: 'http://www.youtube.com/watch?v=__VQX2Xn7tI',
                words: 'A kiss for luck and we\'re on our way. We\'ve only begun.'}
                });
});

app.get('/reference', function (req, res) {
    db.open(function (error, client) {
        if (error) throw error;

        var collection = new mongodb.Collection(client, 'reference');

        collection.find({}).toArray(function (err, docs) {
            res.render('reference.hbs', {reference: docs});
            db.close();
        });

    });
});

app.get('/reference/:command', function (req, res) {
    Commands.find({title: req.params.command}, function (err, docs) {
        res.render('reference.hbs', {commands: docs});
    });
})

app.get('/examples', function (req, res) {
    res.render('examples.hbs',{quote:
                {link: 'http://www.youtube.com/watch?v=96GCfykZ0qE',
                 words: 'They say they don\'t need money. They\'re setting a bad example.'}
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
