var mongo = require('mongodb').MongoClient;

var Database = process.env.DATABASE_URL;

module.exports = function (io) {
  mongo.connect(Database, function(err, db){
    if(err){
      throw err;
    }

    var users = {};

    var nsp = io.of('/chat');
    nsp.on('connection', function(socket){

      var addedUser = false;

      var coll = db.collection('messages');

      var sendStatus = function(s) {
        socket.emit('status', s);
      }

      //emit all messages
      coll.find().limit(100).sort({_id: 1}).toArray(function(err, result){
        if(err){
          throw err;
        }

        socket.emit('output', result);
      });

        //
        socket.on('add user', function(username){
          socket.username = username;



          users[username] = username;


          addedUser = true;

          nsp.emit('loggedIn', {
            users : users
          });




        });
        //wait for input
        socket.on('input', function(data){
          var name = data.name;

          var message = data.message;
          var whiteSpacePattern = /^\s*$/;

          if(whiteSpacePattern.test(message)) {
            sendStatus('Message is required');
          } else {
            coll.insert({name: name, message: message}, function(){
              //emit latest message to all clients
              io.emit('output', [data]);

              sendStatus({
                message: 'Message sent',
                clear: true
              })
            });
          }
        });


        socket.on('disconnect', function(){
          if (addedUser) {
            delete users[socket.username];


            nsp.emit('loggedIn', {
              users : users
            });
          }
        });

    });
  });

}
