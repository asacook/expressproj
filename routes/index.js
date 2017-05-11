var express = require('express');
var io = require('../app').io;
var router = express.Router();
var db = require('../utils/DBHelper');
var helper = require('../utils/HelperFunctions')
var twitter = require('../utils/TwitterAPI')

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
  res.send({title: 'Search Tweets', tweets: [], labels: [], chartData1: [], maxScale: 0, message: "Please enter a query" })
  // res.status(200).render('index', {title: 'Search Tweets', tweets: [], labels: [], chartData1: [], maxScale: 0, message: "Please enter a query" });
});

/*  API Call and Post Call  */
router.post('/', function(req,res,next) {
  console.log(req)
  pName = req.body.player_input;
  tName = req.body.team_input;
  uName = req.body.user_input;
  if (pName == "" && tName == "" && uName == "") {
    res.status(200).render('index', {title: 'Search Tweets', tweets: [], labels: [], chartData1: [], maxScale: 0, message: "Please enter a query" });
  }
  searchFromId = db.getLastId(pName, tName, function(error, searchFromId) {
    search_params = helper.createSearchParams(uName, pName, tName)
    if (uName != "") {
      search_user = true;
    } else{
      search_user = false;
    }
    params = {q: search_params, count:300, since_id:searchFromId};

    console.log(params);
    if(req.body.querySelector == "query_all") {
      database_only = false;
    } else {
      database_only = true;
    }
    twitter.twitterQueries(database_only, params, req,res,next);
  });
});

module.exports = router;
