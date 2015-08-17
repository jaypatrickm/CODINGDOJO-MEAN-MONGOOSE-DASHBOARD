// require the path module
var path = require("path");
// require express and create the express app
var express = require("express");
var app = express();
// require bodyParser since we need to handle post data for adding a user
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded());
// static content
app.use(express.static(path.join(__dirname, "./static")));
// set the views folder and set up ejs
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
// listen on 3333
var server = app.listen(3333, function() {
	console.log("listening on port 3333")
})

var io = require('socket.io').listen(server);
var mongoose = require('mongoose');
// This is how we connect to the mongodb using mongoos -- "basic_mongoose" is the name of our db in mongodb -- this should match the name of the db you are to use for your project
mongoose.connect('mongodb://localhost/mongeese');



var UserSchema = new mongoose.Schema( {
	name: String, 
	age: Number,
	favorite_color: String,
	date: { type: Date, default: Date.now }
})

//add validations using path
UserSchema.path('name').required(true, 'Name cannot be blank');
UserSchema.path('age').required(true, 'Age cannot be blank');
UserSchema.path('favorite_color').required(true, 'Favorite Color cannot be blank');
var User = mongoose.model('User', UserSchema);

// var io = require('socket.io').listen(server);
var mongoose_data = '';
var mongoose_selected = '';

// root route
app.get('/', function(req, res) {
	
	User.find({},  function(err, users){
		//console.log(users);
		mongoose_data = users;
		console.log(mongoose_data);
		if (err)
		{
			console.log('could not get users')
		}
		else {
			res.render('index');
		}
	}).sort('-date');
})

app.get('/mongooses/new', function(req, res) {
	res.render('add');
})

app.get('/mongooses/:id', function(req, res) {
	console.log(res);
	User.find({_id: req.params.id},  function(err, data){
		console.log(data);
		mongoose_selected = data;
		//console.log(mongoose_data);
		if (err)
		{
			console.log('could not get users')
		}
		else {
			res.render('show');
		}
	})
	// res.render('show');
})

app.get('/mongooses/:id/edit', function(req, res) {
	console.log(res);
	User.find({_id: req.params.id},  function(err, data){
		console.log(data);
		mongoose_selected = data;
		//console.log(mongoose_data);
		if (err)
		{
			console.log('could not get users')
		}
		else {
			res.render('edit');
		}
	})
	// res.render('show');
})
// app.get('/quotes', function(req, res) {
// 	User.find({},  function(err, users){
// 		console.log(users);
// 		quote_data = users;
// 		if (err)
// 		{
// 			console.log('could not get users')
// 		}
// 		else {
			
// 		}
// 	}).sort('-date');
// 	// This is where we would get the users from the database and send them to the index view to be displayed.
// 	res.render('quotes');
// })

io.sockets.on('connection', function(socket) {
	console.log('WE ARE USING SOCKETS!');
	console.log(socket.id);
	socket.emit('mongoose_data', mongoose_data);
	socket.emit('mongoose_selected', mongoose_selected);
})

// route to add a user
app.post('/mongoooses', function(req, res) {
	console.log("POST DATA", req.body);
	// create a new User with the name and age corresponding to those from req.body
	var mongoose = new User({name: req.body.name, age: req.body.age, favorite_color: req.body.color});
	// try to save that new user to the database (this is the method that actually inserts into the db) and run a callback function with an error (if any) from the operation.
	mongoose.save(function(err) {
		//if there is an error console.log that something went wrong!
		if(err)
		{
			res.render('add', {title: 'you have errors!', errors: mongoose.errors})
		}
		else
		{
			console.log('successfully added a user!');
			res.redirect('/');
		}
	})
})

app.post('/mongooses/:id', function(req, res) {
	console.log("POST DATA", req.body);
	// create a new User with the name and age corresponding to those from req.body
	// var mongoose = new User({name: req.body.name, age: req.body.age, favorite_color: req.body.color});
	// try to save that new user to the database (this is the method that actually inserts into the db) and run a callback function with an error (if any) from the operation.
	User.update({_id: req.params.id}, {name: req.body.name, age: req.body.age, favorite_color: req.body.color}, function(err) {
		res.redirect('/');
	})
})

app.post('/mongooses/:id/destroy', function(req, res) {
	console.log("POST DATA", req.body);
	// create a new User with the name and age corresponding to those from req.body
	// var mongoose = new User({name: req.body.name, age: req.body.age, favorite_color: req.body.color});
	// try to save that new user to the database (this is the method that actually inserts into the db) and run a callback function with an error (if any) from the operation.
	User.remove({_id: req.params.id}, function(err, user) {
		res.redirect('/');
	})
})