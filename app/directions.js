// Functions to get Google Maps directions.
var express = require('express')
var request = require('request')
var async = require('async')
var router = express.Router()
var GoogleMapsAPIKey = process.env.GoogleMapsAPIKey
var googleMapsClient = require('@google/maps').createClient({
  key: GoogleMapsAPIKey
});

router.get('/', function(req, res, next){
  async.waterfall([
    function(cb){
      if(req.query.originAddr && req.query.destinationAddr) {
        cb(null)
      } else {
        cb({
          code: 400,
          text: 'Provide both origin and destination addresses.'
        })
      }
    },
    // Try geocoding the origin address
    function(cb) {
      googleMapsClient.geocode({
        address: req.query.originAddr
      }, function(err, response){
        if(!err && response.json.results.length) {
          debugger
          // Store the geocoded address data in a local variable
          res.locals.addressData = { 'origin' : response.json.results[0] }
          debugger
          cb(null)
        } else {
          debugger
          cb({
            text: 'Error geocoding origin address: ' + err,
            code: 500
          })
        }
      })
    },
    // Try geocoding the destination address
    function(cb) {
      debugger
      googleMapsClient.geocode({
        address: req.query.destinationAddr
      }, function(err, response){
        if(!err && response.length ) {
          debugger
          // Store the geocoded address data in a local variable
          res.locals.addressData.destination = response.json.results[0]
          cb(null)
        } else {
          debugger
          cb({
            text: 'Error geocoding destination address: ' + err,
            code: 500
          })
        }
      })
    }
  ],

  // Final CB function to handle all errors and the ultimate results.
  function(err, results) {
    if(err) {
        res.status(err.code || 500).send(err.text)
    } else {
      res.send(results)
    }
  })
})

module.exports = router
