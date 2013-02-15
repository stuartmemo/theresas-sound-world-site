var db = require('../database');
/*
 * GET home page.
 */

db.init();

exports.index = function(req, res){
    res.render('index.hbs');
};

exports.download = function (req, res) {
    res.render('download.hbs', {
        quote: {
            link: 'http://www.youtube.com/watch?v=T5jHO4jMPxA',
            words:'Position yourself on another man\'s cruise. One to share, the other to choose.'
        }
    });
};

exports.gettingStarted = function (req, res) {
    res.render('getting-started.hbs', {
        quote: {
            link: 'http://www.youtube.com/watch?v=__VQX2Xn7tI',
            words: 'A kiss for luck and we\'re on our way. We\'ve only begun.'
        }
    });
};

exports.reference = function (req, res) {
    db.query('reference', function (core, fx, music) {
        res.render('reference.hbs', {referenceCore: core, referenceFx: fx, referenceMusic: music});
    });
};

exports.examples = function (req, res) {
    res.render('examples.hbs', {
        quote: {
            link: 'http://www.youtube.com/watch?v=96GCfykZ0qE',
            words: 'They say they don\'t need money. They\'re setting a bad example.'}
        }
    );
};

/*
 * Admin pages
 */

// Get
exports.admin = function (req, res) {
    db.query('reference', function (core, fx, music) {
        res.render('admin.hbs', {referenceCore: core, referenceFx: fx, referenceMusic: music});
    });
};

exports.formCreate = function (req, res) {
    res.render('formCreate.hbs');
};

exports.formDelete = function (req, res) {
    res.render('formDelete.hbs');
};

// Post
exports.createRecord = function (req, res) {
    db.save(req.body, function () {
        res.redirect('/admin');
    });
};

exports.deleteRecord = function (req, res) {
    
};
