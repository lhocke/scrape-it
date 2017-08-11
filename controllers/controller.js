var express = require("express");
var path = require("path");

var router = express.Router()

router.get("/", function(req, res) {
    console.log("request")
    Article.find({}, function(error, doc) {
        if (error) throw error;
        else {
            res.render("index", doc)
        };
    })
});

router.get("/scrape", function(req, res) {
    request("http://bbc.co.uk"), function(error, response, html) {
        var $ = cheerio.load(html);
        $("gel-layout__item").each(function(i, element) {
            var result = {};
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