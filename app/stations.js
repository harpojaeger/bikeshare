var request = require('request')
var cachedRequest = require('cached-request')(request)
cachedRequest.setCacheDirectory('/tmp/cache')
var async = require('async')
var xml = require('xml2js')
var geocode = require('./geocode')
var geolib = require('geolib')
var GoogleMapsAPIKey = process.env.GoogleMapsAPIKey
var googleMapsClient = require('@google/maps').createClient({
  key: GoogleMapsAPIKey
});

var findClosestStations =  function(lat, long, minBikes, minDocks, theFinalCB) {
  debugger
  var addressData
  async.waterfall([
    function(cb) {
      if(lat && long) {
        cb(null)
      } else {
        cb({
          text: 'Provide lat and long.',
          code: 400
        })
      }
    },
    // Fetch current bikeshare data
    function(cb){
      cachedRequest({
        ttl: 30000,
        url: 'http://feeds.capitalbikeshare.com/stations/stations.xml'
      },
      function(error, response,body) {
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
    // Parse the XML bikeshare data
    function(returnedXML, cb){
      // Stop xml2js' abuse of arrays so it's easier to access properties
      var parser = new xml.Parser({explicitArray : false })
      parser.parseString(returnedXML, function(err, result) {
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
    // Do a straight-line distance calculation to each station to create a subset of stations to actually get walking directions for.
    function(parsedXML, waterfallCB) {
      var stationList = parsedXML.stations.station
      // I'm using 'mapCB' to distinguish the callback function inside async.map from waterfallCB, the callback in the top-level async.waterfall function.
      async.map(stationList, function(station, mapCB) {
        var retval = station
        // Do the distance calculation
        var distance = geolib.getDistance(
          {
            latitude: lat,
            longitude: long
          },
          {
            latitude: station.lat,
            longitude: station.long
          },
          1, 1
        )

        if(distance) {
          // Give the station a distance property.
          retval.distance = distance
          // It worked: on to the next one.
          mapCB(null, retval)
        } else {
          // Throw an error to the async.map callback
          mapCB('Error calculating distance to station ' + retval.id)
        }
      },

      // This is mapCB
      function(err, transformed) {
        if(err) {
          // So mapCB is basically a passthrough for waterfallCB
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
      // Sort stations by straightline distance
      function compareDistances(a, b) {
        if (a.distance < b.distance) return -1
        if (a.distance > b.distance) return 1
        return 0
      }
      stations.sort(compareDistances)
      // Filter by minimum number of bikes and docks needed.
      async.filter(stations,
        function(station, filterCB) {
          filterCB(null, ( (parseInt(station.nbBikes) >= minBikes) && (parseInt(station.nbEmptyDocks) >= minDocks) ) )
        },
        function(err, results) {
          cb(null, results)
        }
      )
    },
    function(stations, cb) {
      // Produce an array with the coordinates of the 20 closest stations.
      var nearbyStations = stations.slice(0,20)
      var nearbyStationCoords = []
      nearbyStations.forEach(function(station){
        nearbyStationCoords.push(station.lat + ',' + station.long)
      })
      // Compute walking distance/time for all stations in the subset.
      var originCoords = [lat + ',' + long]
      debugger
      googleMapsClient.distanceMatrix({
        mode: 'walking',
        origins: originCoords,
        destinations: nearbyStationCoords
      },
      function(err, response){
        debugger
        if (err) {
          cb(err)
        } else {
          // Add the walking direction data to each station as the walkingDirections property.  There doesn't seem to be a neater way of doing this.  It'd be nice if you could pass a custom ID to the distanceMatrix call and have it returned.
          for (i in response.json.rows[0].elements) {
            nearbyStations[i].walkingDirections = response.json.rows[0].elements[i]
          }
          cb(null, nearbyStations)
        }
      })
    },
    function(stations, cb) {
      // Now that we have it, sort by walking time, rather than by straightline distance.
      function compareWalkingTime(a, b) {
        if (a.walkingDirections.duration.value < b.walkingDirections.duration.value) return -1
        if (a.walkingDirections.duration.value > b.walkingDirections.duration.value) return 1
        return 0
      }
      stations.sort(compareWalkingTime)
      cb(null, stations)
    }
  ],
    function(err, results) {
      if(err) {
        theFinalCB({
          text: err.err,
          code: err.code || 500
        })
      } else {
        theFinalCB(null,results)
      }
    }
  )
}

module.exports = findClosestStations
