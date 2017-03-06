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
var findClosestStations = require('./stations')

var assembleDirections = function(originAddr, destinationAddr, theFinalCB){
  // Variable to store all the address data.
  var addressData
  // Variable to store all the direction info, per the schema in /test/directions.js
  var allDirections = {}
  async.waterfall([
    function(cb){
      if(originAddr && destinationAddr) {
        cb(null, originAddr)
      } else {
        cb({
          code: 400,
          text: 'Provide both origin and destination addresses.'
        })
      }
    },
    // Try geocoding the origin address
    geocode,
    // Store the geocoded origin
    function(geocoded, cb) {
      addressData = { 'origin' : geocoded}
      // Call the geocode function again with the destination addr
      cb(null, destinationAddr)
    },
    // Try geocoding the destination address
    geocode,
    function(geocoded, cb) {
      // Store the geocoded destination
      addressData['destination'] = geocoded
      // Determine the first bikeshare station
      cb(null, addressData.origin.formatted_address, addressData.destination.formatted_address, 'walking')
    },
    getDirections
  ],

  // Final CB function to handle all errors and the ultimate results.
  function(err, results) {
    if(err) {
      theFinalCB({
        text:err.text,
        code: err.code || 500
      })
    } else {
      debugger
      theFinalCB(null, results)
    }
  })
}

module.exports = assembleDirections
