var env = require('../ENV.js');
var Twitter = require('twitter');
var db = require('../utils/DBHelper');
var helper = require('../utils/HelperFunctions');
const SparqlClient = require('sparql-client-2');

var exports = module.exports = {};

exports.searchDBPedia = function(pName, callback) {
  findURLfromPlayer(pName, function(err, query) {
    if (err) {
      callback(err, null)
    } else {
      if(query) {
        var endpoint = 'http://dbpedia.org/sparql';
        const sClient = new SparqlClient(endpoint)
           .register({dbase: 'http://dbpedia.org/resource/'})
           .register({dbpedia: 'http://dbpedia.org/property/'})
           .register({rdfs: 'http://www.w3.org/2000/01/rdf-schema#'});

        sClient.query(query).execute()
          .then(response => {
            var values = response.results.bindings[0]
            callback(null, castDBInfo(values))
          }).catch(error => {
            callback(error, null)
          });
      } else {
        callback(null,null)
      }
    }
  });
}

function findURLfromPlayer(user_input, callback) {
  var query_url;
  var parameter;
  pName = String(user_input).replace(/or|and/gi, '')
  var input_values = extract_params(pName.split(" "));
  if (input_values.is_user) {
    query_url = db.GET_PLAYER_DBPAGE;
    parameter = [input_values.name]
  } else {
    query_url = db.GET_URL_FROM_PLAYERNAME;
    parameter = ['%' + String(input_values.name).toLowerCase() + '%'];
  }
  
  db.db_client.query(query_url, parameter, function(err, result) {
    if (err) {
      console.
      callback(err, null);
    } else {
      console.log("PLAYER SEARCH RESULT: ");
      if (result.length <= 0) {
        console.log("NO PLAYER FOUND");
        callback(null, null);
      } else {
        playerURL = result[0].dbpedia_url
        const SPARQL = SparqlClient.SPARQL;
        var fQuery = SPARQL`
                  PREFIX dbase: <http://dbpedia.org/resource/>
                  PREFIX dbpedia: <http://dbpedia.org/property/>
                  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                  SELECT ?label ?birthPlace ?birthDate ?currentclub ?position ?comment
                  WHERE {
                    ${{dbase: playerURL}} rdfs:label ?label .
                    ${{dbase: playerURL}} dbpedia:birthPlace ?birthPlace .
                    ${{dbase: playerURL}} dbpedia:birthDate ?birthDate .
                    ${{dbase: playerURL}} dbpedia:currentclub ?currentclub .
                    ${{dbase: playerURL}} dbpedia:position ?position .
                    ${{dbase: playerURL}} rdfs:comment ?comment .
                    filter(langMatches(lang(?label),"EN")) .
                    filter(langMatches(lang(?comment),"EN"))
                  }
                  LIMIT 10`;
        callback(null, fQuery);
      }
    }
  });
}

function castDBInfo(results) {
  var data = {
    name: results.label.value,
    birth_place: helper.extractValue(results.birthPlace.value),
    birth_date: results.birthDate.value,
    club: helper.extractValue(results.currentclub.value.replace("_", " ")),
    position: helper.extractValue(results.position.value).split(" ")[0],
    description: results.comment.value
  }
  return data
}

function extract_params(search_params) {
  var params;
  var type = search_params.filter((x) => {return x.includes("@")});
  if (type.length > 0) {
    params = {
      "is_user": true,
      "name": type[0].replace('@','')
    };
  } else {
    var player_name = search_params.filter((x) => {return !(x.includes('#')) || !(x.includes('@'))});
    params = {
      "is_user": false,
      "name": player_name.join("")
    };
  }
  return params;
}
