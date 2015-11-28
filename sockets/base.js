var mongo = require('mongodb').MongoClient;

module.exports = function (io) {
  mongo.connect('mongodb://127.0.0.1/chat', function(err, db){
    if(err){
      throw err;
    }

    var users = {};


    io.on('connection', function(socket){

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

          io.emit('loggedIn', {
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
          

            io.emit('loggedIn', {
              users : users
            });
          }
        });

    });
  });

}
