/*
*   HELPER FUNCTIONS
*/

var exports = module.exports = {}

/**
* Parses inputs from the forms into a the form used for a search query
*
* @param user an entered username
* @param player a player name or hashtag
* @param team a team name of hastag
* @return the search query to be used in the API / Database
*
**/
exports.createSearchParams = function(user, player, team, logic1, logic2) {
  var search_array = []

  if (player != "") {
    search_array.push(player)
  }

  if (player != "" && team != ""){
    if (logic1 === "and") {
      search_array.push("AND");
    }else{
      search_array.push("OR");
    }
  }

  if (team != "") {
    search_array.push(team)
  }

  if(team != "" && user != ""){
    if (logic2 === "and") {
      search_array.push("AND");
    }else{
      search_array.push("OR");
    }
  }

  if (user != "") {
    user_search = "from:" + uName
    search_array.push(user_search);
  }


  console.log(search_array.join(" "));
  return search_array.join(" ");
}


/**
* Creates a Javascript object out of the returned tweets
* Key fields represent the dates to be used as labels in the graph
* Values are the count of each tweet made on that specific dates
*
* @param tweet_data the JSON object of returned tweets from a query
* @return the graph labels as an array
*
**/
exports.getGraphData = function(tweet_data) {
  //Create graph data
  var data = {};
  for (var i = 0; i < tweet_data.length; i++) {
    var key = new Date(Date.parse(JSON.stringify(tweet_data[i].date))).toDateString();
    if (!(key in data)) {
      data[key] = 1; //new date
    } else {
      data[key]++; //incremement count
    }
  }
  return data;
}

/**
* Returns the graph values from the Object containing the graph data as an array.
*
* @param data the Key-Value pairs of tweet dates with count of tweets on that date
* @return the counts of the tweets in an array.
*
**/
exports.getGraphValues = function(data) {
  //Return Object values in an array for Chart.js
  var values = [];
  for(key in data) {
    if(data.hasOwnProperty(key)) {
      values.push(data[key]);
    }
  }
  return values;
}


/**
* Fetch the date and time from a date-time string
*
* @param string_time the string containing the date and time of a tweet
* @return date and time parsed in a useful form as an array
*
**/
exports.getDateAndTime = function(string_time) {
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


/**
* Converts a dictionary to an array
* Used in converting the returned JSON object of search results into a list containing a list of data about a specific search result
*
* @param dictionary the JSON object of search results
* @return an array containing arrays of tweet information.
*
**/
exports.dict2Array = function(dictionary) {
  arrays = [];
  for (var i = 0; i < dictionary.length; i++) {
    var t = dictionary[i]
    arrays.push([t.player, t.team, t.tweet_id, t.user, t.date, t.time, t.text])
  }
  return arrays;
}

/**
* Converts an array into a "dictionary"
* Used to convert a tweet into an Object with key-value pairs for each field of data about the tweet
*
* @param array an array of information about a tweet
* @return a dictionary with key-value pairs taken from the array parameter.
*
**/
exports.array2Dict = function(array) {
  var tweet_dict = {
    player: array[0],
    team: array[1],
    tweet_id: array[2],
    user: array[3],
    time: array[4],
    date: array[5],
    text: array[6]
  }
  return tweet_dict;
}

exports.extractValue = function (url_value) {
  var item_val = url_value.split("/")
  var value = item_val[item_val.length-1]
  return value.replace("_", " ")
}
