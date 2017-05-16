var mysql = require('mysql');
var helper = require('../utils/HelperFunctions');
var env = require('../ENV.js');
const SparqlClient = require('sparql-client-2');


var exports = module.exports = {};

// Database Connection
var db = mysql.createConnection(
    {
      host     : 'stusql.dcs.shef.ac.uk',
      port     : '3306',
      user     : process.env.DB_USER,
      password : process.env.DB_PASS,
      database : process.env.DB_NAME
    }
);

// Initialized connection with database
db.connect();

/*
* DATABASE COMMAND CONSTANTS
*/

const GET_ALL_ROWS = "SELECT * FROM football;"
const GET_PLAYER_TEAM = "SELECT player,team,tweet_id,user,date,time,text FROM football WHERE player = ? AND team = ?;"
const GET_BY_USER = "SELECT user,date,time,text,tweet_id FROM football WHERE user = ?"
const GET_LAST_ID = "SELECT MAX(tweet_id) AS tweet_id FROM football WHERE player = ? and team = ?"
const ADD_ITEM_TO_DB = "INSERT IGNORE INTO football (player,team,tweet_id,user,date,time,text) VALUES (?,?,?,?,?,?,?);"
const GET_PLAYER_DBPAGE = "SELECT dbpedia_url FROM player_info WHERE twitter_handle = ?"
const GET_URL_FROM_PLAYERNAME = "SELECT dbpedia_url FROM player_info WHERE name LIKE ?"



/*
*   DATABASE HANDLING FUNCTIONS
*/

/**
 * Populates a database with new tweets from a returned Object containing the query results.
 * INSERT IGNORE statement inlcluded in the string constant "ADD_ITEM_TO_DB" avoids duplicate tweets being added.
 * @param  tweets  an Object (dictionary type structure) of tweets to be added to the database

 */
exports.populateDatabase = function(tweets) {
  tweet_list = helper.dict2Array(tweets)
  for (var i = 0; i < tweet_list.length; i++) {
    db.query(ADD_ITEM_TO_DB, tweet_list[i], twitterCallbacks)
  }
}

/**
 * Retrives tweets from the database based on search terms
 * Performs the AND union of the sets of results containing the player name, the team name and both.
 *
 * @param  player the player's name, or hashtag
 * @param team the team name, hashtag
 * @param callback the callback function.

 */
exports.getTweets = function(player, team, callback) {
  db.query(GET_PLAYER_TEAM, [player, team], function(error, results) {
    var all_results = []
    if (error) throw error;
    for (var i = 0; i < results.length; i++) {
      all_results.push(results[i]);
    }
    callback(null, all_results)
  });
}

/**
 * Retrives tweets from the database based on entered user name
 *
 * @param  player the player's username
 * @param team the team's username
 * @param callback the callback function.

 */
exports.getTweetsByUser = function(user, team, callback) {
  db.query(GET_BY_USER, user, function(error, results) {
    var all_results = []
    if (error) throw error;
    for (var i = 0; i < results.length; i++) {
      all_results.push(results[i]);
    }
    console.log(all_results);
    callback(null, all_results)
   });
}

/**
 * Retrives the most recent tweet from a query
 *
 * @param  player the player's username
 * @param team the team's username
 * @param callback the callback function.

 */
exports.getLastId = function(player, team, callback) {
  db.query(GET_LAST_ID, [player, team], function(error, result) {
    if(error) throw error;
    var id = result[0].tweet_id
    console.log(result);
    console.log(id);
    callback(null, id)
  });
}

exports.searchDBPedia = function(pName, callback) {
  findURLfromPlayer(pName, function(err, query) {
    if (err) {
      callback(err, null)
    } else {
      var endpoint = 'http://dbpedia.org/sparql';
      const sClient = new SparqlClient(endpoint)
         .register({dbase: 'http://dbpedia.org/resource/'})
         .register({dbpedia: 'http://dbpedia.org/property/'});

      sClient.query(query).execute()
        .then(response => {
          console.log(response.results.bindings[0])

          var values = response.results.bindings[0]

          callback(null, castDBInfo(values))
        });
    }
  });
}


function castDBInfo(results) {
  var data = {
    bith_date: results.birthDate.value,
    club: results.currentclub.value,
    position: results.position.value
  }
  return data
}

function findURLfromPlayer(pName, callback) {
    console.log("Got hereeeeeeeeeeee");
    console.log(String(pName).replace(" ", '').toLowerCase())
    db.query(GET_URL_FROM_PLAYERNAME, ['%' + String(pName).replace(" ", '').toLowerCase() + '%'], function(err, result) {
      if (err) {
        callback(err, null);
      } else {
        playerURL = result[0].dbpedia_url
        const SPARQL = SparqlClient.SPARQL;
        var fQuery = SPARQL`
                  PREFIX dbase: <http://dbpedia.org/resource/>
                  PREFIX dbpedia: <http://dbpedia.org/property/>
                  SELECT ?birthDate ?currentclub ?position
                  WHERE {
                    ${{dbase: playerURL}} dbpedia:birthDate ?birthDate .
                    ${{dbase: playerURL}} dbpedia:currentclub ?currentclub .
                    ${{dbase: playerURL}} dbpedia:position ?position
                  }
                  LIMIT 10`;
        callback(null, fQuery);
      }
    });
  }





//Error handling function
twitterCallbacks = function(error, result, fields) {
  if(error){
    throw error;
    db.end();
  }
}
