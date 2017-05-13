var express = require('express');
var io = require('../app').io;
var router = express.Router();
var db = require('../utils/DBHelper');
var helper = require('../utils/HelperFunctions')
var twitter = require('../utils/TwitterAPI')


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

  //
  //TODO adapt for implementation into router.post
  //
  db.findURLfromPlayer("WayneRooney", function(err, data) {
    if (err) {
      console.log("Error!");
    } else {

      var playerURL = data;

      //Preamble
      const SparqlClient = require('sparql-client-2');
      const SPARQL = SparqlClient.SPARQL;
      const endpoint = 'http://dbpedia.org/sparql';

      //Construct SPARQL dbpedia query with correct prefixes.
      var query = SPARQL`PREFIX dbase: <http://dbpedia.org/resource/> PREFIX dbpedia: <http://dbpedia.org/property/> SELECT ?caps FROM <http://dbpedia.org> WHERE { ${{dbase: playerURL}} dbpedia:caps ?caps} LIMIT 10`;

      //Register client and execute query.
      var client = new SparqlClient(endpoint)
         .register({dbase: 'http://dbpedia.org/resource/'})
         .register({dbpedia: 'http://dbpedia.org/property/'});

         client.query(query)
           .execute()
           .then(function (results) {
             //Print results.
             console.dir(results, {depth: null});
           })
           .catch(function (error) {
             console.log("Error!")
           });

    }
    });

  res.send({title: 'Search Tweets', tweets: [], labels: [], chartData1: [], maxScale: 0, message: "Please enter a query" })

  // console.log("Query to " + endpoint);
  // console.log("Query: " + query);
  // client.query(query)
  //   .bind('player', '<http://dbpedia.org/page/Wayne_Rooney>')
  //   .execute(function(error, results) {
  //     process.stdout.write(util.inspect(arguments, null, 20, true)+"\n");1
  //   });
  // res.status(200).render('index', {title: 'Search Tweets', tweets: [], labels: [], chartData1: [], maxScale: 0, message: "Please enter a query" });
});

/*  API Call and Post Call  */
router.post('/', function(req,res,next) {
  console.log(req)
  pName = req.body.player_input;
  tName = req.body.team_input;
  uName = req.body.user_input;
  if (pName == "" && tName == "" && uName == "") {
    res.status(200).render('index', {title: 'Search Tweets', tweets: [], labels: [], chartData1: [], maxScale: 0, message: "Please enter a query" });
  }
  searchFromId = db.getLastId(pName, tName, function(error, searchFromId) {
    search_params = helper.createSearchParams(uName, pName, tName)
    if (uName != "") {
      search_user = true;
    } else{
      search_user = false;
    }
    params = {q: search_params, count:300, since_id:searchFromId};

    console.log(params);
    if(req.body.querySelector == "query_all") {
      database_only = false;
    } else {
      database_only = true;
    }
    twitter.twitterQueries(database_only, params, req,res,next);
  });
});




module.exports = router;
