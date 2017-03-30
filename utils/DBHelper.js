var mysql = require('mysql');
var helper = require('../utils/HelperFunctions')
var env = require('../ENV.js')


var exports = module.exports = {};
// DATABSE CONNECTION
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

/*
*   DATABASE HANDLING FUNCTIONS
*/

exports.populateDatabase = function(tweets) {
  tweet_list = helper.dict2Array(tweets)
  for (var i = 0; i < tweet_list.length; i++) {
    db.query(ADD_ITEM_TO_DB, tweet_list[i], twitterCallbacks)
  }
}

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

exports.getLastId = function(player, team, callback) {
  db.query(GET_LAST_ID, [player, team], function(error, result) {
    if(error) throw error;
    var id = result[0].tweet_id
    console.log(result);
    console.log(id);
    callback(null, id)
  });
}

twitterCallbacks = function(error, result, fields) {
  if(error){
    throw error;
    db.end();
  }
}
