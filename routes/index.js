var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', index);

module.exports = router;

function index(req, res, next) {
	var loggedin = false;
			if(req.session.user){
				loggedin = true;
			}

	res.render('index', { title: 'Home', user: loggedin});
}
