var mongodb = require('mongodb'),
    server = new mongodb.Server('localhost', 27017, {}),
    database = mongodb.Db('theresaSite', server, {});

module.exports = {
    init: function () {
        database.open(function (error, client) {
            if (error) throw error;
            console.log('we cool!');
        });
    },

    query: function (queryString, cb) {
        var collection = new mongodb.Collection(database, queryString);

        collection.find({}).sort({friendlyName: 1}).toArray(function (err, docs) {
            var core = [],
                fx = [],
                music = [];

            docs.forEach(function (record) {
                switch (record.library) {
                    case 'core':
                        core.push(record);
                        break;
                    case 'fx':
                        fx.push(record);
                        break;
                    case 'music':
                        music.push(record);
                        break;
                    default:
                        break;
                };
            });

            cb(core, fx, music);
        });
    },

    save: function (data, cb) {
        var collection = new mongodb.Collection(database, 'reference');
        collection.save(
            {
                title: data.title,
                name: data.name,
                description: data.description,
                syntax: data.syntax,
                library: data.library
            }
        );
        cb();
    }
};
