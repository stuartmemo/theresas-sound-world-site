/*
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    hbs = require('hbs'),
    mongodb = require('mongodb'),
    app = express(),
    isDev = false;

hbs.registerPartial('header', fs.readFileSync(__dirname + '/views/header.hbs', 'utf8'));
hbs.registerPartial('title-home', fs.readFileSync(__dirname + '/views/title-home.hbs', 'utf8'));
hbs.registerPartial('title-mini', fs.readFileSync(__dirname + '/views/title-mini.hbs', 'utf8'));
hbs.registerPartial('menu', fs.readFileSync(__dirname + '/views/menu.hbs', 'utf8'));
hbs.registerPartial('reference-item', fs.readFileSync(__dirname + '/views/reference-item.hbs', 'utf8'));
hbs.registerPartial('footer', fs.readFileSync(__dirname + '/views/footer.hbs', 'utf8'));
hbs.registerPartial('admin', fs.readFileSync(__dirname + '/views/admin.hbs', 'utf8'));

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
    isDev = true;
});

app.get('/', routes.index);
app.get('/download', routes.download);
app.get('/getting-started', routes.gettingStarted);
app.get('/examples', routes.examples);
app.get('/reference', routes.reference);

if (isDev) {
    // Get
    app.get('/admin', routes.admin);
    app.get('/admin/create', routes.formCreate);
    app.get('/admin/delete', routes.formDelete);

    // Post
    app.post('/admin/create', routes.createRecord);
    app.post('/admin/delete', routes.deleteRecord);
}

app.get('/reference/:command', function (req, res) {
    Commands.find({title: req.params.command}, function (err, docs) {
        res.render('reference.hbs', {commands: docs});
    });
})

app.get('/examples/effects', function (req, res) {
    Commands.find({}, function (err, docs) {
        res.render('effects.hbs');
    });
});

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
