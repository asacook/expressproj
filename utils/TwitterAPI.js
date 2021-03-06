var env = require('../ENV.js');
var Twitter = require('twitter');
var db = require('../utils/DBHelper');
var helper = require('../utils/HelperFunctions');
var dbpedia = require('../utils/DBPedia');

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

/**
* Performs a search through the API if user intends, calls a function to query the database otherwise
*
* @param database_only a boolean value from the UI checkbox
* @param params the search parameters
* @param req,res,next the callback function
*
**/
exports.twitterQueries = function(database_only, search_query, params, req, res, next) {
  if (!database_only) {
    client.get('search/tweets', params, showApiTweets);
  } else {
    showDbTweets(pName, tName, uName)
  }

  /**
  * Handles the search results from the API request.
  * Adds new found tweets to the database as a caching process.
  * Renders the page.
  *
  * @param error an error handler for the database
  * @param tweets the results from the API request
  *
  **/
  function showApiTweets(error, tweets, response, callback) {
    var tweet_results;
    var message;
    var labels;
    var maxScale;
    if (!error) {
      var queried_tweets = queryTweets(tweets, pName, tName, search_query);
      db.populateDatabase(queried_tweets)
      var graphData = helper.getGraphData(queried_tweets)
      var values = helper.getGraphValues(graphData)
      if (queried_tweets.length == 0) {
        message = "No new tweets found online. Look for existing tweets in the database"
        labels = []
        maxScale = 0
      }
      else {
        message = "success"
        labels = JSON.stringify(Object.keys(graphData))
        maxScale = (values[values.length-1])
      }

      dbpedia.searchDBPedia(pName, function(err, playerInfo) {

        if(err) {
          res.send({error:err})
        } else {
          if(playerInfo) {
            res.send({title: 'Search Tweets', player_info: playerInfo, tweets: queried_tweets, labels: labels, chartData1: values, maxScale: maxScale, message: message });
          } else {
            var rest_params = {title: 'Search Tweets', player_info: {}, tweets: queried_tweets, labels: labels, chartData1: values, maxScale: maxScale, message: message }
            console.log(Object.prototype.toString(rest_params))
            res.send(rest_params);
          }
        }
      });

    } else {
        res.send({"error":error})
    }
  }


  /**
  * Accesses the database to show tweets
  * Queries by username if the user has requested to.
  *
  * @param player the name or hashtag of a particular player
  * @param team the team name or hashtag
  * @param username the username of a twitter user
  *
  **/
  function showDbTweets(player, team, username) {
    if (search_user) {
      tweet_results = db.getTweetsByUser(username, tName, tweetQueryHandler);
    } else {
      tweet_results = db.getTweets(pName, tName, tweetQueryHandler);
    }
  }

  /**
  * Simple error handler to show a message if there are no new tweets to show
  * Otherwise render the page as normal
  *
  * @param err an error handler for database connectivity.
  * @param tweet_data the tweet search results to be rendered.
  *
  **/
  function tweetQueryHandler(err, tweet_data) {
    if (err) {
      console.log("THERE WAS AN ERROR QUERYING THE DATABASE");
    } else {
      dbpedia.searchDBPedia(pName, function(err, playerInfo) {
        if(err) {
          res.send({error:err})
        } else {
          if (tweet_data.length == 0) {
            tweet_data = [];
            labels = [];
            values = [];
            maxScale = 0;
            message = "No new tweets found on the database. Look for tweets using the API";
          } else {
            graphData = helper.getGraphData(tweet_data)
            labels = JSON.stringify(Object.keys(graphData));
            values = helper.getGraphValues(graphData)
            maxScale = (values[values.length-1]);
            message = "success";
          }

          if(playerInfo) {
            console.log(playerInfo)
            res.send({title: 'Search Tweets', player_info: playerInfo, tweets: tweet_data, labels: labels, chartData1: values, maxScale: maxScale, message: message });
          } else {
            console.log(playerInfo)
            res.send({title: 'Search Tweets', player_info: {}, tweets: tweet_data, labels: labels, chartData1: values, maxScale: maxScale, message: message });
          }
        }
      });
   }
  }
};

/**
* Formats the search results into a form in which they can be displayed more easily
*
* @param tweets the search results
* @param player the player name or hashtag
* @param team the team name or hashtag
* @return a JavaScript Object of search results ready for displaying on the page.
*
**/
function queryTweets(tweets, player, team, query_params){
    var all_tweets = []
    var player_name = String(player).replace(/[^0-9a-z]/gi, '').toLowerCase();
    var team_name = String(team).replace(/[^0-9a-z]/gi, '').toLowerCase();

    for (var i = 0; i < tweets.statuses.length; i++) {
      var tweet = tweets.statuses[i];
      date_and_time = helper.getDateAndTime(tweet.created_at)
      tweet_dict = helper.array2Dict([query_params, player_name, team_name, tweet.id_str,
                  tweet.user.screen_name, date_and_time[1], date_and_time[0], tweet.text, tweet.retweet_count, tweet.favorite_count])
      all_tweets.push(tweet_dict)
    }
    return all_tweets;
};
