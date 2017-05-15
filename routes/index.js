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

    if(req.body.querySelector == "query_all") {
      database_only = false;
    } else {
      database_only = true;
    }
    twitter.twitterQueries(database_only, params, req,res,next);
  });

  //Find DBPedia URL from database based on UserName entered.
  db.findURLfromPlayer(uName, function(err, data) {
    if (err) {
      console.log("Error!");
    } else {

      //Extract DBPedia information.
      var playerURL = data;

      //Preamble and interface set-up.
      const SparqlClient = require('sparql-client-2');
      const SPARQL = SparqlClient.SPARQL;
      const endpoint = 'http://dbpedia.org/sparql';

      //Construct SPARQL dbpedia query with desired property names.
      var birthDateQuery = SPARQL`PREFIX dbase: <http://dbpedia.org/resource/> PREFIX dbpedia: <http://dbpedia.org/property/> SELECT ?birthDate FROM <http://dbpedia.org> WHERE { ${{dbase: playerURL}} dbpedia:birthDate ?birthDate} LIMIT 10`;
      var teamQuery = SPARQL`PREFIX dbase: <http://dbpedia.org/resource/> PREFIX dbpedia: <http://dbpedia.org/property/> SELECT ?currentclub FROM <http://dbpedia.org> WHERE { ${{dbase: playerURL}} dbpedia:currentclub ?currentclub} LIMIT 10`;
      var positionQuery = SPARQL`PREFIX dbase: <http://dbpedia.org/resource/> PREFIX dbpedia: <http://dbpedia.org/property/> SELECT ?position FROM <http://dbpedia.org> WHERE { ${{dbase: playerURL}} dbpedia:position ?position} LIMIT 10`;

      //Put into array for easy iterating through.
      var qArray = [birthDateQuery, teamQuery, positionQuery];

      //Register client and execute query.
      var client = new SparqlClient(endpoint)
         .register({dbase: 'http://dbpedia.org/resource/'})
         .register({dbpedia: 'http://dbpedia.org/property/'});

         var resultsArray = new Array();

         for (var i = 0; i < qArray.length; i++) {
           client.query(qArray[i]).execute()
            .then(function (results) {
                resultsArray.push(results.results.bindings[0])
                if (i == 2) {
                resultsArray.push(results.results.bindings[0])
                console.log(resultsArray);
                }

              }).catch(function (error) {
                console.log("Err!");
            });
         }

      }
    });
});


function extractDBPediaInfo(uName) {

}


module.exports = router;
