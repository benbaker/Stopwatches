var http	= require("http"),
	url		= require("url"),
	path	= require('path'),
	express= require("express"),
	jade	= require("jade"),
	redis	= require("redis"),
	moment	= require("moment"),
	util	= require("util"),
	app		= express();

var server = {
	port: process.env.PORT || 8888
};

jade.options = {
	pretty: true
};

var now = function(){
	return moment().format('H:mm:ss');
};

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));


app.use(function(req, res, next){
	util.log(req.method +" : '" + req.url + "'");
	next();
});


app.get('/', function(req, res){
	res.render('stopwatches', jade.options);
	res.end('Hi there!');
});



app.listen(server.port);
console.log('server port: ' + server.port);