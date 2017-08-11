var express = require('express');
var exphbs = require('express-handlebars');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var request = require('request');
var cheerio = require('cheerio');
var logger = require('morgan');

mongoose.promise = Promise;

var app = express();
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

app.engine("handlebars", exphbs({ defaultLayout: "main"}));
app.set("view engine", "handlebars");

app.use(express.static(process.cwd() + "/public"));

var databaseUri = "mongodb://localhost/scraper";

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    useMongoClient: true
  });
}
else {
  mongoose.connect(databaseUri, {
    useMongoClient: true
  });
};

var db = mongoose.connection;

db.on("error", function(error) {
    console.log("Mongoose error: ", error);
});

db.once("open", function() {
    console.log("Mongoose connection successful.");
});

var Note = require('./models/Note.js');
var Article = require('./models/Article.js');
var router = express.Router();

router.get("/", function(req, res) {
  res.render("index");
    Article.find({}, function(error, doc) {
        if (error) throw error;
        else {
          console.log(doc)
            var hbsObject= {articles: doc}
            
        };
    });
    // console.log("request")
});

router.get("/scrape", function(req, res) {
    request("http://bbc.com/news"), function(error, response, html) {
        var $ = cheerio.load(html);
        $("gel-layout__item").each(function(i, element) {
            var result = {};
            console.log(element)
            result.title = $(this).children("h3").text();
            result.link = $(this).children("a").attr("href");
            result.text = $(this).children("p").first().text();

            var entry = new Article(result);

            entry.save(function(err, doc) {
                if (err) throw err;
                else {
                    console.log(doc)
                    res.redirect("/")
                }
            });
        });
    }
    res.send("Scrape Complete")
});

router.get("/articles", function(req, res) {
    Article.find({}, function(error, doc) {
        if (error) throw error;
        else {
            res.send(doc);
        };
    });
});

router.get("/articles/:id", function(req, res) {
    Article.findOne({"_id": req.params.id}).populate("note").exec(function(error, doc) {
        if (error) throw error;
        else {
            res.send(doc)
        };
    });
});

router.post("/articles/:id", function(req, res) {
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

app.use("/", router);

var PORT = 3000 || process.env.PORT;
app.listen(PORT, function(){
    console.log("App listening on: ", PORT)
});