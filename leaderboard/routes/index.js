var express = require('express');
var router = express.Router();
var queries = require('../db/queries');

var tables = ['bostonofficeworkout'];

/* GET home page. */
router.get('/', function(req, res, next) {
    var db = req.db;
    var fullResults = [];
    for (var table of tables) {
        db.any(queries.channelLeaderboard(table), true)
            .then(function (data) {
                for (var row in data) {
                    console.log("row: " + JSON.stringify(row));
                    fullResults.push(data[row]);
                }
                console.log("full results: " + JSON.stringify(fullResults));
                res.render('index', {
                    fullResults: fullResults 
                });
            })
            .catch(function (error) {
                console.error("caught error: " + error);
            });
    }
});

module.exports = router;
