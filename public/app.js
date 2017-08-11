$.getJSON("/articles", function(data) {
    for (var i =0; i < data.length; i++) {
        $(".articles").append("<div> class='panel panel-default' data-id='" + data[i]._id + "'>" + "<div class='panel-heading><a href='" data[i].link + "'><h3>" + data[i].title + "</h3></a></div><div class='panel-body'><p>" + data[i].body);
    }
});