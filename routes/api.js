/*
/
/ This script acts as the API for the mobile Cordova application,
/ and is displayed when a user accesses the index page of the web app.
/ It is simply two handlers for GET and POST requests.
/
*/

var express = require('express');
var io = require('../app').io;
var router = express.Router();
var db = require('../utils/DBHelper');
var helper = require('../utils/HelperFunctions')
var twitter = require('../utils/TwitterAPI')

//Initialise variables
var query = 0;
database_only = true;
search_user = false
pName = ""
tName = ""
uName = ""
searchFromId = ""
var params = {};



/*  GET home page  */
router.get('/', function(req, res) {
  res.send({title: 'Search Tweets', tweets: [], player_info: {}, labels: [], chartData1: [], maxScale: 0, message: "Please enter a query" })
});

router.get('/all', function(req, res) {
  db.getAllTweets(function(error, data) {
    res.send({tweets: data})
  })
})

/*  API Call and Post Call  */
router.post('/', function(req,res,next) {

  //Retrieve field names from request.
  pName = req.body.player_input;
  tName = req.body.team_input;
  uName = req.body.user_input;

  //Logical query connectives.
  optional1 = req.body.optional1;
  optional2 = req.body.optional2;

  //Handles "blank" query
  if (pName == "" && tName == "" && uName == "") {
    res.status(200).render('index', {title: 'Search Tweets', tweets: [], labels: [], chartData1: [], maxScale: 0, message: "Please enter a query" });
  }

  //Parses inputs from the forms into a the form used for a search query.
  search_params = helper.createSearchParams(uName, pName, tName, optional1, optional2)

  //Get most recent tweet id to only return tweets made after this.
  searchFromId = db.getLastId(search_params, function(error, searchFromId) {
    if (uName != "") {
      search_user = true;
    } else{
      search_user = false;
    }
    params = {q: search_params, count:300, since_id:searchFromId};

    //API or Database
    if(req.body.querySelector == "query_all") {
      database_only = false;
    } else {
      database_only = true;
    }
    //Search.
    twitter.twitterQueries(database_only, search_params, params, req,res,next);
  });
});

module.exports = router;
