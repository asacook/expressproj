/*
*   HELPER FUNCTIONS
*/

var exports = module.exports = {}

exports.createSearchParams = function(user, player, team) {
  var search_array = []
  if (user != "") {
    user_search = "from:" + uName
    search_array.push(user_search)
  }
  if (player != "") {
    search_array.push(player)
  }
  if (team != "") {
    search_array.push(team)
  }
  return search_array.join(" ")
}

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

exports.dict2Array = function(dictionary) {
  arrays = [];
  for (var i = 0; i < dictionary.length; i++) {
    var t = dictionary[i]
    arrays.push([t.player, t.team, t.tweet_id, t.user, t.date, t.time, t.text])
  }
  return arrays;
}

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
