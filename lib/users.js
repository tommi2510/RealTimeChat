'use strict';

var hash = require('./password-hash').hashing;
var mongo = require('mongodb').MongoClient;

var Database = 'mongodb://127.0.0.1/chat';

function createUserWithHashAndSalt(username, salt, hash, cb){
	mongo.connect(Database, function(err, db){
		if(err){
			return cb(err);
		}

    var coll = db.collection('users');

    coll.insert({
      username: username,
       salt: salt,
      hash: hash,
      date: new Date()
    }, function(err, result){
      db.close();

      if(err){
        return cb(err);
      }
      //console.log(result);
      return cb(null, true);

    });
	});
}

function findUser(username, cb){
	mongo.connect(Database, function(err, db){
		if(err){
			return cb(err);
		}

    var coll = db.collection('users');

    coll.find({username: username}).toArray(function(err, result){
      db.close();

      if(err){
        return cb(err);
      }

      return cb(null, result);
    });
	});
}

module.exports.createUser = function(username, password, cb){
	hash(password, function(err, salt, hash){
		if(err){
			return cb(err);
		}

	createUserWithHashAndSalt(username, salt, hash, cb);

	});
};

module.exports.auth = function(username, password, fn){
	findUser(username, function(err, result){
		var user = null;

    
		if(result.length === 1){
			user = result[0];
		}
		if(!user){
			return fn(new Error('Cannot find user'));
		}

		hash(password, user.salt, function(err, hash){
			if(err){
				return fn(err);
			}
			if(hash === user.hash){
				return fn(null, user);
			}
			fn(new Error('Invalid password'));



		});

	});
};
