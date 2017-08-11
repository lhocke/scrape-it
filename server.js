var express = require('express');
var exphbs = require('express-handlebars');
var mongoose = require('mongoose');
var request = require('request');
var cheerio = require('cheerio');
var bodyParser = require('body-parser');
var logger = require('morgan');



var PORT = 3000 || process.env.PORT;

mongoose.promise = Promise;

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

app.engine("handlebars", exphbs({ defaultLayout: "main"}));
app.set("view engine", "handlebars");

app.use(express.static("public"));

mongoose.connect('mongodb://localhost/scrape-it');
var db = mongoose.connection;

db.on("error", function(error) {
    console.log("Mongoose error: ", error);
});

db.once("open", function() {
    console.log("Mongoose connection successful.");
});

var Note = require('./models/Note.js');
var Article = require('./models/Article.js');
var router = require("./controllers/controller.js");
app.use("/", router);

app.listen(PORT, function(){
    console.log("App listening on: ", PORT)
});