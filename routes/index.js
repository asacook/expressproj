var express = require('express');
var Twitter = require('twitter');
var router = express.Router();

var client = new Twitter({
consumer_key: 'BhBDTS4urGoSYW2x3TD9xk939',
consumer_secret: 'DmYGQRS3gjx7cIMZa54dobSWV1ShQgTpTnXVNE3RWFQpn0rqXj',
access_token_key: '844220358416879618-A13Z7i481T2DcuSvCVFaVMgL3QHEkXe',
access_token_secret: 'PN8f3atQ1vXoBuCojT9t8XcDC0tjlbbtMaw6bDGfNgvKw'
});



/* GET home page. */
router.get('/', function(req, res, next) {
var params = {q: 'mancity'};
  client.get('search/tweets', params, function(error, tweets, response) {
  if (!error) {
    // var tweet_list = tweets.statuses;
    // var name_one = tweet_list[0].text;

    var all_tweets = []
    for (var i = 0; i < tweets.statuses.length; i++) {
          var statuses = tweets.statuses[i];

          var id = statuses.id;
          var user = statuses.user.screen_name;
          var time = statuses.created_at;
          var text = statuses.text;
          var retweets = statuses.retweet_count;
          var favorites = statuses.favorite_count;

          // all_tweets.push(
          //   { id: id
          //     user: user,
          //     time: time,
          //     text: text,
          //     retweets: retweets,
          //     favorites: favorites
          //   });
          all_tweets.push([id,user,time,text,retweets,favorites])
          // all_tweets.push(id);
      }

      res.status(200).render('index', {title: 'Search Tweets', tweets: all_tweets});
  } else {
        res.status(500).json({ error: error });
      }
  });
});

module.exports = router;
