//Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require('express-handlebars');
var request = require("request");
var cheerio = require("cheerio");


//Express
var app = express();


//Mongoose
mongoose.Promise = Promise;


//Handlbars
app.set('views', './app/views');
app.engine('hbs', exphbs({
  extname: '.hbs',
  defaultLayout  : 'main',
  layoutsDir     : './app/views/layouts/',
  partialsDir    : './app/views/partials/'
  }));
app.set('view engine', '.hbs');


//BodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));


//Setup Morgan
app.use(require('morgan')('dev'));


//Require Models
var Note = require("./app/models/Note.js");
var Article = require("./app/models/Article.js");


//public folder
app.use(express.static('app/public'));


//Index route
app.get('/', function(req, res) {
  res.render('index');
});

//Database configuration with mongoose
var MONGODB_URI = "mongodb://heroku_4lmrjtfx:6h4k8lh9f539vm7cj42d4cp2ac@ds137336.mlab.com:37336/heroku_4lmrjtfx" || "mongodb://localhost/mongoHeadlines";

//"mongodb://heroku_4lmrjtfx:6h4k8lh9f539vm7cj42d4cp2ac@ds137336.mlab.com:37336/heroku_4lmrjtfx" ||

mongoose.connect(MONGODB_URI);
var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});


//Scrape the New York Times
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  console.log("you got here");
  request("http://www.nytimes.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("h2.story-heading").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");
      result.saved=false;

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });

    });
  });
  // Tell the browser that we finished scraping the text
  //res.send("Scrape Complete");
  res.render('scrape');

});

app.get("/saved",function(req, res) {
  console.log("you got here");
  res.render('saved');

  });
app.post("/api/saved", function (req, res) {
    console.log("the body");
    console.log(JSON.stringify(req.body));
    console.log("the body");  
   Article.update(req.body, {
      $set: {
        saved: true
      }
    }, function(err, doc) {
      if (err) {
        res.send(err);
      } else {
      res.send(doc);
    }
    });
    
});


app.get("/api/saved", function (req, res) {

 Article.find({"saved": true}, function(err, doc) {
      if (err) {
        res.send(err);
      } else {
      res.send(doc);
    }
    });
 //res.render('saved');   
});


app.post("/api/deletesaved/:id", function (req, res) {

 Article.update({'_id': req.params.id}, {
      $set: {
        saved: false
      }
    }, function(err, doc) {
      if (err) {
        res.send(err);
      } else {
      res.send(doc);
    }
    });
});
//all articles
app.get("/articles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});


//
app.post('/deletenote/:id', function(req, res) {
    // using the id passed in the id parameter,
    // prepare a query that finds the matching one in our db...
    console.log(req.params.id);
    Note.findOne({ '_id': req.params.id })
        // and populate all of the notes associated with it.
        .remove({ _id: req.params.id})
        // now, execute our query
        .exec(function(err, doc) {
            // log any errors
            if (err) {
                console.log(err);
            }
            // otherwise, send the doc to the browser as a json object
            else {
                res.json(doc);
            }
        });
});


//single article and note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Note.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("body")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});


app.post('/articles/:id', function(req, res) {
    // create a new note and pass the req.body to the entry.
    var newNote = new Note(req.body);
    console.log(req.body);
    // and save the new note the db
    newNote.save(function(err, doc) {
        // log any errors
        if (err) {
            console.log(err);
        }
        // otherwise
        else {
            // using the Article id passed in the id parameter of our url,
            // prepare a query that finds the matching Article in our db
            // and update it to make it's lone note the one we just saved
            Article.findOneAndUpdate({ '_id': req.params.id }, { 'note': doc._id })
                // execute the above query
                .exec(function(err, doc) {
                    // log any errors
                    if (err) {
                        console.log(err);
                    } else {
                        // or send the document to the browser
                        res.send(doc);
                    }
                });
        }
    });
});


var PORT = process.env.PORT || 3000;


//Express listener
app.listen(PORT, function() {
  console.log("App running on port 3000!");
});
