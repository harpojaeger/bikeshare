var express = require('express')
var request = require('request')
var async = require('async')
var xml = require('xml2js')
var router = express.Router()
var GoogleMapsAPIKey = process.env.GoogleMapsAPIKey
var googleMapsClient = require('@google/maps').createClient({
  key: GoogleMapsAPIKey
});
var geolib = require('geolib')

// Set a local with the address, for either origin or destination
router.get('/', function(req, res, next) {
  async.waterfall([
    function(cb){
      if(req.query.addr) {
        cb(null, req.query.addr)
      } else {
        cb({
          text: 'No address provided.',
          code: 400
        })
      }
    },
    function(queryAddr, cb) {
      googleMapsClient.geocode({
        address: queryAddr
      }, function(err, response){
        if(!err) {
          cb(null,response.json.results[0])
        } else {
          cb({
            text: 'Error geocoding address: ' + err,
            code: 500
          })
        }
      })
    },
    function(results, cb){
      res.locals.addressData = results
      console.dir(res.locals.addressData)
      request('http://feeds.capitalbikeshare.com/stations/stations.xml', function(error, response,body) {
        if (!error && response.statusCode == 200) {
          cb(null, body)
        } else {
          cb({
            text: 'Error fetching Capital Bikeshare XML: ' + error,
            code: response.statusCode
          })
        }
      })
    },
    function(returnedXML, cb){
      xml.parseString(returnedXML, function(err, result) {
        if (err) {
          cb({
            text: 'XML parse error: '+ err,
            code: 500
          })
        } else {
          cb(null, result)
        }
      })
    },
    function(parsedXML, waterfallCB) {
      var stationList = parsedXML.stations.station
      console.log('Ready to process', stationList.length, 'stations.')
      async.map(stationList, function(station, mapCB) {
        var retval = station
        var addressLat = res.locals.addressData.geometry.location.lat
        var addressLng = res.locals.addressData.geometry.location.lng
        var distance = geolib.getDistance(
          {
            latitude: addressLat,
            longitude: addressLng
          },
          {
            latitude: station.lat[0],
            longitude: station.long[0]
          },
          1, 1
        )

        if(distance) {
          retval.distance = distance
          mapCB(null, retval)
        } else {
          mapCB('Error calculating distance to station ' + retval.id[0])
        }
      },
      function(err, transformed) {
        if(err) {
          waterfallCB({
            text: 'Error calculating distances: ' + err,
            code: 500
          })
        } else {
          waterfallCB(null, transformed)
        }
      })
    },
    function(stations, cb) {
      function compareDistances(a, b) {
        if (a.distance < b.distance) return -1
        if (a.distance > b.distance) return 1
        return 0
      }
      stations.sort(compareDistances)
      var minBikes = req.query.minBikes || 0
      var minDocks = req.query.minDocks || 0
      async.filter(stations,
        function(station, filterCB) {
          filterCB(null, ((parseInt(station.nbBikes[0]) >= minBikes) && (parseInt(station.nbEmptyDocks[0]) >= minDocks)))
        },
        function(err, results) {
          console.log('Found', results.length, 'stations matching criteria.')
          cb(null, results)
        }
      )
    }
  ],
    function(err, results) {
      if(err) {
        console.log('Got an error')
        res.status(err.code || 500).send(err.text)
      } else {
        var stationList = '<ol>\n'
        async.each(results.slice(0,20),
          function(station, cb) {
            stationList += "<li>" + station.name + ': ' + station.nbBikes + ' bikes, ' + station.nbEmptyDocks + ' docks.</li>\n'
            cb(null)
          },
          function(err){
            if (err) {
              res.send(err)
            } else {
              stationList +="</ol>"
              res.send(stationList)
            }
          }
        )
      }
    }
  )
})



module.exports = router
