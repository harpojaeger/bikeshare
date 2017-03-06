// Functions to get Google Maps directions.
var express = require('express')
var request = require('request')
var async = require('async')
var router = express.Router()
var GoogleMapsAPIKey = process.env.GoogleMapsAPIKey
var googleMapsClient = require('@google/maps').createClient({
  key: GoogleMapsAPIKey
});
var geocode = require('./geocode')
var getDirections = require('./getDirections')

router.get('/', function(req, res, next){
  async.waterfall([
    function(cb){
      if(req.query.originAddr && req.query.destinationAddr) {
        cb(null, req.query.originAddr)
      } else {
        cb({
          code: 400,
          text: 'Provide both origin and destination addresses.'
        })
      }
    },
    // Try geocoding the origin address
    geocode,
    // Store the geocoded origin data in a local.
    function(geocoded, cb) {
      res.locals.addressData = { 'origin' : geocoded}
      // Call the geocode function again with the destination addr
      cb(null, req.query.destinationAddr)
    },
    // Try geocoding the destination address
    geocode,
    function(geocoded, cb) {
      // Store the geocoded destination data in a local
      res.locals.addressData['destination'] = geocoded
      // Set up a local to store all the direction info, per the schema in /test/directions.js
      res.locals.allDirections = {}
      // Determine the first bikeshare station
      cb(null, res.locals.addressData.origin.formatted_address, res.locals.addressData.destination.formatted_address, 'walking')
    },
    getDirections
  ],

  // Final CB function to handle all errors and the ultimate results.
  function(err, results) {
    if(err) {
        res.status(err.code || 500).send(err.text)
    } else {
      debugger
      res.send(results)
    }
  })
})

module.exports = router
