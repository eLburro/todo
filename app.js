// service registration
var application_root = __dirname;
var express = require("express");
var path = require("path");
var mongoose = require('mongoose');
var app = express();

// database model
// local deployment: mongodb://localhost/my_database
// heroku deployment: mongodb://heroku_app22961195:1o26d4airhl8d57lfbedghaga3@ds053808.mongolab.com:53808/heroku_app22961195
var uristring = process.env.MONGOLAB_URI || 'mongodb://localhost/my_database';

mongoose.connect(uristring, function (err, res) {
  if (err) { 
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + uristring);
  }
});

var TodoItem = mongoose.model('TodoItem', new mongoose.Schema({
    title: String,
    description: String,
    done: Boolean,
    prio: Number,
    author: String,
    list: Number
}));

// express configuration
app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(application_root, "public")));
    app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
    app.set('views', path.join(application_root, "views"));
    app.set('view engine', 'jade')
});


/*** ROUTES ***/
// start site => redirect to /todo
app.get('/', function(req, res) {
    res.redirect('/todo');
});

// overview
app.get('/todo', function(req, res) {
    res.render('todo', {title: "little *Scrum Board* (by Ramón Burri)"});
});


/*** MongoDB API calls ***/
// get all
app.get('/api/todos', function(req, res) {
    return TodoItem.find(function(err, todos) {
        return res.send(todos);
    });
});

// get one item by Id
app.get('/api/todos/:id', function(req, res) {
    return TodoItem.findById(req.params.id, function(err, todo) {
        if (!err) {
            return res.send(todo);
        }
    });
});

// edit an item
app.put('/api/todos/:id', function(req, res) {
    return TodoItem.findById(req.params.id, function(err, todo) {
        todo.title = req.body.title;
        todo.description = req.body.description;
        todo.done = req.body.done;
        todo.prio = req.body.prio;
        todo.author = req.body.author;
        todo.list = req.body.list;

        return todo.save(function(err) {
            if (!err) {
                console.log("updated");
            }
            return res.send(todo);
        });
    });
});

// insert an item
app.post('/api/todos', function(req, res) {
    var todo;
    todo = new TodoItem({
        title: req.body.title,
        description: req.body.description,
        done: req.body.done,
        prio: req.body.prio,
        author: req.body.author,
        list: req.body.list
    });
    todo.save(function(err) {
        if (!err) {
            return console.log("created");
        }
    });
    return res.send(todo);
});

// delete an item
app.delete('/api/todos/:id', function(req, res) {
    return TodoItem.findById(req.params.id, function(err, todo) {
        return todo.remove(function(err) {
            if (!err) {
                console.log("removed");
                return res.send('')
            }
        });
    });
});

// listen on given port or port 5000
var port = Number(process.env.PORT || 5000);
app.listen(port);
