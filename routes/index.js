var express = require('express');
var Twitter = require('twitter');
var mysql = require('mysql');
var env = require('../ENV.js')
var io = require('../app').io;
var router = express.Router();

const GET_ALL_ROWS = "SELECT * FROM football;"
const GET_PLAYER_TEAM = "SELECT player,team,tweet_id,user,date,time,text FROM football WHERE player = ? AND team = ?;"
const GET_BY_USER = "SELECT user,date,time,text,tweet_id FROM football WHERE user = ?"
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
var params = {q: '#rooney'};
var user_params = {q: 'from:rooney'};

/* GET home page. */
router.get('/', twitterQueries);

router.post('/', function(req,res,next) {
  var pName = req.body.player_input;
  var tName = req.body.team_input;
  if(req.body.radioUser == "user") {
    params = {q: 'from:'+ pName + " " + tName};
    search_user = true;
  }else{
    params = {q: pName + " " + tName};
    search_user = false;
  }
  if(req.body.querySelector == "query_all") {
    database_only = false;
  } else {
    database_only = true;
  }
  twitterQueries(req,res,next);
});

function twitterQueries(req, res, next) {
  client.get('search/tweets', params, getSearchTweets);
  var param_values = params.q.split(" ")
  var player_name = param_values[0]
  var team_name = param_values[1]

  function getSearchTweets(error, tweets, response) {
    var tweet_results;
    if (!error) {
      if (!database_only) {
        var queried_tweets = queryTweets(tweets, player_name, team_name);
        populateDatabase(queried_tweets)
      }

      if (search_user) {
        var username = player_name.split(":")[1]
        console.log(username)
        tweet_results = getTweetsByUser(username, team_name, tweetQueryHandler);
      } else {
        tweet_results = getTweets(player_name, team_name, tweetQueryHandler);
      }

    } else {
        res.status(500).json({ error: error });
    }
  };

  function tweetQueryHandler(err, tweet_data) {
    if (err) {
      console.log("THERE WAS AN ERROR QUERYING THE DATABASE");
    } else {

      //Create graph data
      var graphData = {};
      for (var i = 0; i < tweet_data.length; i++) {
        var key = new Date(Date.parse(JSON.stringify(tweet_data[i].date))).toDateString();
        if (!(key in graphData)) {
          graphData[key] = 1; //new date
        } else {
          graphData[key]++; //incremement count
        }
      }

      //Return Object values in an array for Chart.js
      var values = [];
      for(key in graphData) {
        if(graphData.hasOwnProperty(key)) {
          values.push(graphData[key]);
        }
      }

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

  module.exports = function(io) {
    io.sockets.on('connection', function() {

    });
  }

  function populateDatabase(tweets) {
    tweet_list = dict2Array(tweets)
    for (var i = 0; i < tweet_list.length; i++) {
      // console.log(tweet_list[i])
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

  function twitterCallbacks(error, result, fields) {
    if(error){
      throw error;
      db.end();
    }
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
