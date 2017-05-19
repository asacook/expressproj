var express = require('express');
var io = require('../app').io;
var router = express.Router();
var db = require('../utils/DBHelper');
var helper = require('../utils/HelperFunctions')
var twitter = require('../utils/TwitterAPI')
var request = require('request')

main_url = "http://localhost:3000"
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
  res.status(200).render('index', {title: 'Search Tweets', tweets: [], player_info: {}, labels: [], chartData1: [], maxScale: 0, message: "Please enter a query" })
});

/*  API Call and Post Call  */
router.post('/', function(req,res,next) {
  request.post("http://localhost:3000/api", {form:req.body}, function(request, response, other) {
    json_res = JSON.parse(response.body)
    res.status(200).render('index', json_res);
  });
});

module.exports = router;
