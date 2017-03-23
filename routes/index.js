var express = require('express');
var Twitter = require('twitter');
var router = express.Router();

var client = new Twitter({
consumer_key: 'BhBDTS4urGoSYW2x3TD9xk939',
consumer_secret: 'DmYGQRS3gjx7cIMZa54dobSWV1ShQgTpTnXVNE3RWFQpn0rqXj',
access_token_key: '844220358416879618-A13Z7i481T2DcuSvCVFaVMgL3QHEkXe',
access_token_secret: 'PN8f3atQ1vXoBuCojT9t8XcDC0tjlbbtMaw6bDGfNgvKw'
});

var query = 0;
var params = {q: '#rooney'};

/* GET home page. */
router.get('/', twitterQueries);


function twitterQueries(req, res, next) {
  if(query == 0) {
    client.get('search/tweets', params, getSearchTweets);
  } else if (query == 1) {
    client.get('users/serach', user_params, getUserTweets);
  }


  function getSearchTweets(error, tweets, response) {
    if (!error) {
      var all_tweets = getAllTweets(tweets);
      res.status(200).render('index', {title: 'Search Tweets', tweets: all_tweets});
    } else {
        res.status(500).json({ error: error });
    }
  };
};

function getAllTweets(tweets){
    var all_tweets = []
    for (var i = 0; i < tweets.statuses.length; i++) {
      var statuses = tweets.statuses[i];
      var id = statuses.id;
      var user = statuses.user.screen_name;
      var time = statuses.created_at;
      var text = statuses.text;
      var retweets = statuses.retweet_count;
      var favorites = statuses.favorite_count;
      all_tweets.push([id,user,time,text,retweets,favorites])
    }
    return all_tweets;
};

  // function getUserTweets(error, user, response) {
  //   if (!error) {
  //     var user_tweets = []
  //
  //
  //
  //     res.status(200).render('index', {title: 'Search Tweets', tweets: user_tweets});
  //   } else {
  //       res.status(500).json({ error: error });
  //   }
  // };



module.exports = router;
