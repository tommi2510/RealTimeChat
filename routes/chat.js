var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/chat', ensureLoggedinIn, chat);

module.exports = router;

//route middlewares

function ensureLoggedinIn(req, res, next) {
  if (req.session.user) {
    next(); // köllum í næsta middleware ef við höfum notanda
  } else {
    res.render('login', {loggedin: 'You will have to be logged in to use this feature!'});
  }
}



function chat(req, res, next) {
	var loggedin = false;
			if(req.session.user){
				loggedin = true;
			}

	res.render('chat', { title: 'Chat', user: loggedin, username: req.session.user.username});
}
