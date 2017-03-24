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

router.post('/', function(req,res,next) {
  var pName = req.body.player_input;
  params = {q: pName};
  twitterQueries(req,res,next);
});

function twitterQueries(req, res, next) {
  if(query == 0) {
    client.get('search/tweets', params, getSearchTweets);
  } else if (query == 1) {
    client.get('users/serach', user_params, getUserTweets);
  }


  function getSearchTweets(error, tweets, response) {
    if (!error) {
      var all_tweets = getAllTweets(tweets);
      // console.log(all_tweets)
      res.status(200).render('index', {title: 'Search Tweets', tweets: all_tweets});
    } else {
        res.status(500).json({ error: error });
    }
  };
};

function getAllTweets(tweets){
  console.log(tweets.statuses)
    var all_tweets = []
    for (var i = 0; i < tweets.statuses.length; i++) {
      var tweet = tweets.statuses[i];
      var author = tweet.user.screen_name;
      var text = tweet.text;
      var date_and_time = getDateAndTime(tweet.created_at)
      var time = date_and_time[0]
      var date = date_and_time[1]
      var url_message = "http://twitter.com/statuses/" + tweet.id_str
      all_tweets.push([author, text, time, date, url_message])
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
