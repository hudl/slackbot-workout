var express = require('express');
var router = express.Router();
var queries = require('../db/queries');

const channels = {
  'london': 'londonfitness',
  'boston': 'bostonofficeworkout',
  'omaha': 'omahafitness',
  'remote': 'remotefitness',
  'sydney': 'sydneyfitness',
  'lincolneast': 'lincolneastfitness',
  'lincolnwest': 'lincolnwestfitness',
};

router.get('/', function(req, res) {
  var db = req.db;
  var fullResults = [];

  console.log("trying to render index");
  db.task(t=> {
    var queriesToRun = [];
    for (var city in channels) {
      console.log(`city: ${city}, table: ${channels[city]}, ${queries.officeTotal(channels[city])}`);
      queriesToRun.push(t.one(queries.officeTotal(channels[city]), true));
    }
    console.log(JSON.stringify(queriesToRun));
    return t.batch(
      queriesToRun
    );
  })
  .then(data => {
    for (var row in data) {
      fullResults.push(data[row]);
      console.log("found data: " + JSON.stringify(data[row]));
    }
    fullResults.sort(function(a, b) {
      return parseFloat(b["completion_pct"]) - parseFloat(a["completion_pct"]);
    });
    res.render('index', {
      fullResults: fullResults,
      city: "",
      channelTotals: undefined,
    });
  })
  .catch(error => {
    console.error("Caught error: " + error);
  });

});

router.get('/:city', function(req, res) {
  console.log(`trying to render ${req.params.city}`);
  getData(req, res);
});

var getData = function(req, res, next) {
  var db = req.db;
  var city = req.params.city;
  var table = channels[city];
  var fullResults = [];
  var channelTotals = {'total_assigned': 0, 'completion_pct': 0};

  console.log(`city: ${city}, table: ${table}`);

  if (table == null) {
    renderTemplate(res);
    return;
  }

  db.any(queries.channelLeaderboard(table), true)
      .then(function (data) {
          for (var row in data) {
              fullResults.push(data[row]);
          }
          console.log("full results: " + JSON.stringify(fullResults));
          console.log("full results count : " + fullResults.length);
          console.log("full results length : " + fullResults.length);
          db.one(queries.officeTotal(table), true)
            .then(function (data) {
              console.log("office total: " + JSON.stringify(data));
              channelTotals = {
                'total_assigned': data['total_assigned'],
                'completion_pct': data['completion_pct']};
              renderTemplate(res, fullResults, city, data);
            })
            .catch(function (error) {
                console.error("caught error: " + error);
            });
      })
      .catch(function (error) {
          console.error("caught error: " + error);
      });
};

var renderTemplate = function(res, fullResults, city, channelTotals) {
  res.render('index', {
      fullResults: fullResults,
      city: city,
      channelTotals: channelTotals,
  });
}

module.exports = router;
