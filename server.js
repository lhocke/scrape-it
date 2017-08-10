var express = require('express');
var exphbs = require('express-handlebars');
var mongoose = require('mongoose');
var request = require('request');
var cheerio = require('cheerio');
var bodyParser = require('body-parser');
var logger = require('morgan');

var Note = require('./models/note.js');
var Article = require('./models/article.js');

mongoose.promise = Promise;

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

mongoose.connect('http://localhost/scrape-it');

var PORT = 3000 || process.env.PORT;

var db = mongoose.connection;

db.on("error", function(error) {
    console.log("Mongoose error: ", error);
});

db.on("open", function() {
    console.log("Mongoose connection successful.");
});

app.get("/scrape", function(req, res) {
    request(""), function(error, response, html) {
        var $ = cheerio.load(html);
        $("article ").each(function(i, element) {
            var result = {};
            result.title = $(this).children("a").text();
            result.link = $(this).children("a").attr("href");
            result.text = $(this).children("p").first().text();

            var entry = new Article(result);

            entry.save(function(err, doc) {
                if (err) throw err;
                else {
                    console.log(doc)
                }
            });
        });
    }
    res.send("Scrape Complete")
});

app.get("/articles", function(req, res) {
    Article.find({}, function(error, doc) {
        if (error) throw error;
        else {
            res.send(doc);
        };
    });
});

app.get("/articles/:id", function(req, res) {
    Article.findOne({"_id": req.params.id}).populate("note").exec(function(error, doc) {
        if (error) throw error;
        else {
            res.send(doc)
        };
    });
});

app.post("/articles/:id", function(req, res) {
    var newNote = req.body;

    newNote.save(function(error, doc) {
        if (error) throw error;
        else {
            Article.findOneAndUpdate({"_id": req.params.id}, {"note":doc._id}).exec(function(err, doc) {
                if (err) throw err;
                else {
                    res.send(doc)
                };
            });
        };
    });
});

app.listen(PORT, function(){
    console.log("App listening on: ", PORT)
});