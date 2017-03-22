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
    var tweet_list = tweets.statuses;
    var name_one = tweet_list[0].text;
    res.status(200).render('index', {title: 'Search Tweets', tweets: name_one});
  } else {
        res.status(500).json({ error: error });
      }
  });
});

module.exports = router;
