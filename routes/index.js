var express = require('express');
var Twitter = require('twitter');
var mysql = require('mysql');
var env = require('../ENV.js')
var io = require('../app').io;
var router = express.Router();

const GET_ALL_ROWS = "SELECT * FROM football;"
const GET_PLAYER_TEAM = "SELECT player,team,tweet_id,user,date,time,text FROM football WHERE player = ? AND team = ?;"
const GET_BY_USER = "SELECT user,date,time,text,tweet_id FROM football WHERE user = ?"
const GET_LAST_ID = "SELECT MAX(tweet_id) AS tweet_id FROM football WHERE player = ? and team = ?"
const ADD_ITEM_TO_DB = "INSERT IGNORE INTO football (player,team,tweet_id,user,date,time,text) VALUES (?,?,?,?,?,?,?);"


var db = mysql.createConnection(
    {
      host     : 'stusql.dcs.shef.ac.uk',
      port     : '3306',
      user     : process.env.DB_USER,
      password : process.env.DB_PASS,
      database : process.env.DB_NAME
    }
);

var client = new Twitter({
consumer_key: process.env.CONSUMER_KEY,
consumer_secret: process.env.CONSUMER_SECRET,
access_token_key: process.env.ACCESS_TOKEN_KEY,
access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

// Initialized connection with database
db.connect();

var query = 0;
database_only = true;
search_user = false
pName = ""
tName = ""
searchFromId = ""
var params = {q:pName + " " + tName};
var user_params = {q: 'from:' + pName + " " + tName};

/*  GET home page  */
router.get('/', twitterQueries);

/*  API Call and Post Call  */
router.post('/', function(req,res,next) {
  searchFromId = getLastId(pName, tName, function(error, searchFromId) {
    pName = req.body.player_input;
    tName = req.body.team_input;
    if(req.body.checkUser == "user") {
      params = {q: 'from:'+ pName + " " + tName, count:300, since_id:searchFromId};
      search_user = true;
    } else{
      params = {q: pName + " " + tName, count:300, since_id:searchFromId};
      search_user = false;
    }

    console.log(params);
    // console.log(search_user);
    if(req.body.querySelector == "query_all") {
      database_only = false;
    } else {
      database_only = true;
    }
    twitterQueries(req,res,next);
  });
});

function twitterQueries(req, res, next) {
  if (!database_only) {
    client.get('search/tweets', params, showApiTweets);
  } else {
    showDbTweets(pName, tName)
  }


  function showApiTweets(error, tweets, response, callback) {
    var tweet_results;
    if (!error) {
      var queried_tweets = queryTweets(tweets, pName, tName);
      populateDatabase(queried_tweets)
      var graphData = getGraphData(queried_tweets)
      var values = getGraphValues(graphData)
      res.status(200).render('index', {title: 'Search Tweets', tweets: queried_tweets, labels: JSON.stringify(Object.keys(graphData)), chartData1: values, maxScale: (values[values.length-1]) });
    } else {
        res.status(500).json({ error: error });
    }
  }

  function showDbTweets(player, team) {
    if (search_user) {
      var username = pName
      tweet_results = getTweetsByUser(username, tName, tweetQueryHandler);
    } else {
      tweet_results = getTweets(pName, tName, tweetQueryHandler);
    }
  }

  function tweetQueryHandler(err, tweet_data) {
    if (err) {
      console.log("THERE WAS AN ERROR QUERYING THE DATABASE");
    } else {
      graphData = getGraphData(tweet_data)
      values = getGraphValues(graphData)
     //Render Jade file with attributes.
     res.status(200).render('index', {title: 'Search Tweets', tweets: tweet_data, labels: JSON.stringify(Object.keys(graphData)), chartData1: values, maxScale: (values[values.length-1]) });
   }
  }
};

function queryTweets(tweets, player_name, team_name){
    var all_tweets = []
    for (var i = 0; i < tweets.statuses.length; i++) {
      var tweet = tweets.statuses[i];
      date_and_time = getDateAndTime(tweet.created_at)
      tweet_dict = array2Dict([player_name, team_name, tweet.id_str,
                  tweet.user.screen_name, date_and_time[1], date_and_time[0], tweet.text])
      all_tweets.push(tweet_dict)
    }
    return all_tweets;
};

  module.exports = function(io) {
    io.sockets.on('connection', function() {

    });
  }

/*
*   DATABASE HANDLING FUNCTIONS
*/

function populateDatabase(tweets) {
  tweet_list = dict2Array(tweets)
  for (var i = 0; i < tweet_list.length; i++) {
    db.query(ADD_ITEM_TO_DB, tweet_list[i], twitterCallbacks)
  }
}

function getTweets(player, team, callback) {
  db.query(GET_PLAYER_TEAM, [player, team], function(error, results) {
    var all_results = []
    if (error) throw error;
    for (var i = 0; i < results.length; i++) {
      all_results.push(results[i]);
    }
    callback(null, all_results)
  });
}

function getTweetsByUser(user, team, callback) {
  db.query(GET_BY_USER, user, function(error, results) {
    var all_results = []
    if (error) throw error;
    for (var i = 0; i < results.length; i++) {
      all_results.push(results[i]);
    }
    callback(null, all_results)
   });
}

function getLastId(player, team, callback) {
  db.query(GET_LAST_ID, [player, team], function(error, result) {
    if(error) throw error;
    var id = result[0].tweet_id
    console.log(result);
    console.log(id);
    callback(null, id)
  });
}

function twitterCallbacks(error, result, fields) {
  if(error){
    throw error;
    db.end();
  }
}

/*
*   HELPER FUNCTIONS
*/

function getGraphData(tweet_data) {
  //Create graph data
  var data = {};
  for (var i = 0; i < tweet_data.length; i++) {
    var key = new Date(Date.parse(JSON.stringify(tweet_data[i].date))).toDateString();
    if (!(key in data)) {
      data[key] = 1; //new date
    } else {
      data[key]++; //incremement count
    }
  }
  return data;
}

function getGraphValues(data) {
  //Return Object values in an array for Chart.js
  var values = [];
  for(key in data) {
    if(data.hasOwnProperty(key)) {
      values.push(data[key]);
    }
  }
  return values;
}

function getDateAndTime(string_time) {
  var date_separator = "-"
  var comp = string_time.split(' ');
  var day_week = comp[0];
  var month = comp[1];
  var day_num = comp[2];
  var timestamp = comp[3];
  var timezone = comp[4];
  var year = comp[5];

  var date = day_num + date_separator + month + date_separator + year;
  var time = timestamp;
  return [date,time];
}

function dict2Array(dictionary) {
  arrays = [];
  for (var i = 0; i < dictionary.length; i++) {
    var t = dictionary[i]
    arrays.push([t.player, t.team, t.tweet_id, t.user, t.date, t.time, t.text])
  }
  return arrays;
}

function array2Dict(array) {
  var tweet_dict = {
    player: array[0],
    team: array[1],
    tweet_id: array[2],
    user: array[3],
    time: array[4],
    date: array[5],
    text: array[6]
  }
  return tweet_dict;
}

module.exports = router;
