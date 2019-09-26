require("dotenv").config();
var express = require("express");
var exphbs = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));


app.engine(
  "handlebars", 
  exphbs({ 
      defaultLayout: "main" 
  })
);
app.set("view engine", "handlebars");


// ----------------require routes---------------------

require("./Routes/apiRoutes")(app);
require("./Routes/htmlRoutes")(app);





//---------------Connect to the Mongo DB--------------------
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });



// Connect to Remote DB???? NODE_ENV?
// var MONGODB_URI = process.env.MONGODB_URI || 
// "mongodb://<dbuser>:<dbpassword>@ds353457.mlab.com:53457/heroku_7p848dk0";
// mongoose.connect(MONGODB_URI, { useNewUrlParser: true });




// --------------------------------------------------------------




//------------------------- Routes-------------------------------

// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("http://time.com/section/us/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article").each(function (i, element) {
      // Save an empty result object
      var result = {};


      
// ---------------------------------------------------- this works ---------------------------------------------------------------


      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(".headline")
        .children("a")
        .text();
      result.link = $(".headline")
        .children("a")
        .attr("href");
      result.summary = $(this)
        .children(".media-body", ".article-info-extended", ".summary")
        .text();

        console.log(result);
      // ------------------------------------------------------------------------------------------------------------------------------

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, log it
          console.log(err);
        });
    });



    // Send a message to the client
    res.send("Scrape Complete");
  });
});



// ---------------Start the server-------------------

app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});

module.exports = app;