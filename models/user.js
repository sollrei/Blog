/**
 * Date: 2014/6/24
 * Update: 2014/6/24
 * (╯°Д°)╯︵ ┻━┻
 */
var mongodb = require('./db');

function User(user) {
    this.name = user.name;
    this.password = user.password;
}


User.prototype.save = function (callback) {
    var user = {
        name: this.name,
        password: this.password
    };

    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }

        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            collection.insert(user, {
                safe: true
            }, function (err, user) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, user[0]);
            });
        });


    });

};



User.get = function(name, callback) {

    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }

        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }

            collection.findOne({
                name: name
            }, function (err, user) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, user);
            });
        });
    });
};


module.exports = User;
