document.addEventListener('DOMContentLoaded', function(){

  var getNode = function(s) {
    return document.querySelector(s);
  }

  //Get required nodes
  var textarea = getNode('.chat textarea');
  var chatName = getNode('.chat-name');
  var status = getNode('.chat-status span');
  var messages = getNode('.chat-messages');
  var sidebar = getNode('.sidebar');



  var statusDefault = status.textContent;


  var setStatus = function(s){
    status.textContent = s;

    if(s !== statusDefault){
      var delay = setTimeout(function(){
        setStatus(statusDefault);
        clearInterval(delay);
      }, 3000);
    }

  }


  try {
    var socket = io.connect('http://127.0.0.1:3000');
  } catch(e) {
    //set status to warn user

  }

  if(socket !== undefined){

    var username = chatName.textContent;
    socket.emit('add user', username);

    socket.on('loggedIn', function(data){
      var obj = data.users;

      while(sidebar.lastChild) {
        if(sidebar.childNodes.length == 1) break;
        sidebar.removeChild(sidebar.lastChild);

      }

      var numUsers = 0;
      for (var x in obj) {
        if (obj.hasOwnProperty(x)) {
          var a = document.createElement('a');
          var i = document.createElement('i');
          a.setAttribute('class', 'item');
          i.setAttribute('class', 'user small green icon');
          a.textContent = obj[x];

          sidebar.appendChild(a);
          a.appendChild(i);

          numUsers++;
        }
      }

      var a1 = document.createElement('a');
      a1.setAttribute('class', 'item');
      a1.textContent = numUsers;
      sidebar.appendChild(a1);


    });



    //Listen for output
    socket.on('output', function(data){
      if(data.length){
        //Loop through results

        for (var i = 0; i < data.length; i++) {
          var messageContainer = document.createElement('div');
          var message = document.createElement('div');
          var p = document.createElement('p');
          var span = document.createElement('span');

          p.setAttribute('class', 'p-color');
          span.setAttribute('class', 'colorText');
          span.textContent = data[i].name + ':  ';
          p.textContent = data[i].message;

          var messageRight = messages.lastChild;

          if(username == data[i].name){
            message.setAttribute('class', 'chat-message');
          } else {
            message.setAttribute('class', 'chat-message messageRight');
          }


          //Append
          messages.appendChild(message);
          message.appendChild(span);
          message.appendChild(p);

          messages.scrollTop = messages.scrollHeight;
        }
      }
    });

    //Listen for status
    socket.on('status', function(data){
      setStatus((typeof data === 'object') ? data.message : data);

      if(data.clear === true){
        textarea.value = '';
      }
    })

    //Listen for keydown
    textarea.addEventListener('keydown', function(event){
      var self = this;
      var name = chatName.textContent;

      //console.log(event);
      if(event.which === 13 && event.shiftKey === false){
        event.preventDefault();

        socket.emit('input', {
          name: name,
          message: self.value
        });


      }
    });
  }
});
