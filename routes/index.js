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
var user_params = {q: 'from:rooney'};

/* GET home page. */
router.get('/', twitterQueries);

router.post('/', function(req,res,next) {
  var pName = req.body.player_input;
  if(req.body.radioUser == "user") {
    params = {q: 'from:'+pName}
  }else{
    params = {q: pName};
  }
  twitterQueries(req,res,next);
});

function twitterQueries(req, res, next) {
  client.get('search/tweets', params, getSearchTweets);



  function getSearchTweets(error, tweets, response) {
    if (!error) {
      var all_tweets = getAllTweets(tweets);

      //Get all dates
      var tweetdates = [];
      for (var i = 0; i < all_tweets.length; i++) {
        tweetdates.push(Date.parse(JSON.stringify(all_tweets[i][3])));
      }


      //Find min and max dates
      var minsofar = Date.now();
      var maxsofar = new Date('January 1, 1990 00:00:00'); //Before Twitter existed...
      for (var i = 0; i < tweetdates.length; i++){
        if (tweetdates[i] < minsofar) {
          minsofar = tweetdates[i];
        }
        if (tweetdates[i] > maxsofar) {
          maxsofar = tweetdates[i];
        }
      }

      res.status(200).render('index', {title: 'Search Tweets', tweets: all_tweets, dateMax: maxsofar, dateMin: minsofar, chartData1: [12, 19, 3, 17, 6, 3, 7], chartData2: [2, 29, 5, 5, 2, 3, 10]});
    } else {
        res.status(500).json({ error: error });
    }
  };
};

function getAllTweets(tweets){
  //console.log(tweets.statuses)
    var all_tweets = []
    for (var i = 0; i < tweets.statuses.length; i++) {
      var tweet = tweets.statuses[i];
      var author = tweet.user.screen_name;
      var text = tweet.text;
      var date_and_time = getDateAndTime(tweet.created_at)
      var date = date_and_time[0]
      var time = date_and_time[1]
      var url_message = "http://twitter.com/statuses/" + tweet.id_str
      all_tweets.push([author, text, time, date, url_message])
    }
    return all_tweets;
};

function getDateAndTime(string_time) {
  var date_separator = "-"
  var comp = string_time.split(' ');
  var day_week = comp[0];
  var month = getMonthNum(comp[1]);
  var day_num = comp[2];
  var timestamp = comp[3];
  var timezone = comp[4];
  var year = comp[5];

  var date = year + date_separator + month + date_separator + day_num;
  var time = timestamp;
  return [date,time];
}

function getMonthNum(monthstring) {
  return ("JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(monthstring)/3 + 1);
}

<<<<<<< HEAD


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



=======
>>>>>>> d6beeb467dcf4c887bcc103fee789a50f844531c
module.exports = router;
