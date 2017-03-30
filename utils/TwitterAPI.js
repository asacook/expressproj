var env = require('../ENV.js');
var Twitter = require('twitter');
var db = require('../utils/DBHelper');
var helper = require('../utils/HelperFunctions');

// Initalizes twitter client
var client = new Twitter({
consumer_key: process.env.CONSUMER_KEY,
consumer_secret: process.env.CONSUMER_SECRET,
access_token_key: process.env.ACCESS_TOKEN_KEY,
access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

var exports = module.exports = {}

/*
* TWITTER API FUNCTIONS
*/

exports.twitterQueries = function(database_only, params, req, res, next) {
  if (!database_only) {
    client.get('search/tweets', params, showApiTweets);
  } else {
    showDbTweets(pName, tName, uName)
  }


  function showApiTweets(error, tweets, response, callback) {
    var tweet_results;
    if (!error) {
      var queried_tweets = queryTweets(tweets, pName, tName);
      db.populateDatabase(queried_tweets)
      if (queried_tweets.length == 0) {
        res.status(200).render('index', {title: 'Search Tweets', tweets: [], labels: [], chartData1: [], maxScale: 0 });
      }
      else {
        var graphData = helper.getGraphData(queried_tweets)
        var values = helper.getGraphValues(graphData)
        res.status(200).render('index', {title: 'Search Tweets', tweets: queried_tweets, labels: JSON.stringify(Object.keys(graphData)), chartData1: values, maxScale: (values[values.length-1]) });
      }
    } else {
        res.status(500).json({ error: error });
    }
  }

  function showDbTweets(player, team, username) {
    if (search_user) {
      tweet_results = db.getTweetsByUser(username, tName, tweetQueryHandler);
    } else {
      tweet_results = db.getTweets(pName, tName, tweetQueryHandler);
    }
  }

  function tweetQueryHandler(err, tweet_data) {
    if (err) {
      console.log("THERE WAS AN ERROR QUERYING THE DATABASE");
    } else {
      graphData = helper.getGraphData(tweet_data)
      values = helper.getGraphValues(graphData)
     //Render Jade file with attributes.
     res.status(200).render('index', {title: 'Search Tweets', tweets: tweet_data, labels: JSON.stringify(Object.keys(graphData)), chartData1: values, maxScale: (values[values.length-1]) });
   }
  }
};

function queryTweets(tweets, player_name, team_name){
    var all_tweets = []
    for (var i = 0; i < tweets.statuses.length; i++) {
      var tweet = tweets.statuses[i];
      date_and_time = helper.getDateAndTime(tweet.created_at)
      tweet_dict = helper.array2Dict([player_name, team_name, tweet.id_str,
                  tweet.user.screen_name, date_and_time[1], date_and_time[0], tweet.text])
      all_tweets.push(tweet_dict)
    }
    return all_tweets;
};
