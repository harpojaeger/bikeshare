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
  var addressData = {
    origin: null,
    destination: null
  }
  // Variable to store all the direction info, per the schema in /test/directions.js
  var allDirections = {
    walking: {
      fromOrigin: null,
      toDestination: null
    },
    biking: null
  }
  // This will hold data on the origin and destination bikeshare stations
  var stationData = {
    origin: null,
    destination: null
  }
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
      addressData.origin = geocoded
      // Call the geocode function again with the destination addr
      cb(null, destinationAddr)
    },
    // Try geocoding the destination address
    geocode,
    function(geocoded, cb) {
      // Store the geocoded destination
      addressData.destination = geocoded
      debugger
      // Determine the origin bikeshare station
      cb(null, addressData.origin.formatted_address, 1, 0)
    },
    findClosestStations,
    function(originStationList, cb) {
      // Store the origin bikeshare station
      stationData.origin = originStationList[0]
      debugger
      // Get walking directions from the origin to the origin bikeshare station
      cb(null,
        addressData.origin.formatted_address,
        stationData.origin.lat + ',' + stationData.origin.long,
        'walking')
    },
    getDirections,
    function(originDirections, cb) {
      debugger
      // Store the origin walking directions
      allDirections.walking.fromOrigin = originDirections
      // Determine the destination bikeshare station
      cb(null, addressData.destination.formatted_address, 0, 1)
    },
    findClosestStations,
    function(destinationStationList, cb) {
      debugger
      // Store the destination bikeshare station
      stationData.destination = destinationStationList[0]
      debugger
      // Get walking directions from the destination bikeshare station to the destination
      cb(null,
        stationData.destination.lat + ',' + stationData.destination.long,
        addressData.destination.formatted_address,
        'walking')
    },
    getDirections,
    function(destinationDirections, cb) {
      debugger
      // Store the destination walking directions
      allDirections.walking.toDestination = destinationDirections
      // Get biking directions between the two stations
      cb(null,
        stationData.origin.lat + ',' + stationData.origin.long,
        stationData.destination.lat + ',' + stationData.destination.long,
        'bicycling')
    },
    getDirections,
    function(bikingDirections, cb) {
      debugger
      allDirections.biking = bikingDirections
      cb(null, allDirections)
    }
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
