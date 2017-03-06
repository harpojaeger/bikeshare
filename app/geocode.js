var GoogleMapsAPIKey = process.env.GoogleMapsAPIKey
var googleMapsClient = require('@google/maps').createClient({
  key: GoogleMapsAPIKey
});

var geocoder = function(queryAddr, cb) {
  googleMapsClient.geocode({
    address: queryAddr
  }, function(err, response){
    debugger
    if(!err && response.json.status=='OK') {
      cb(null, response.json.results[0])
    } else {
      // Return slightly more descriptive status codes based on what we get back from the Google Maps API
      var possibleCodes = {
        'ZERO_RESULTS' : 400,
        'INVALID_REQUEST' : 400,
        'OVER_QUERY_LIMIT' : 429,
        'REQUEST_DENIED' : 403,
        'UNKNOWN_ERROR' : 500,
      }
      cb({
        text: 'Error geocoding address: ' + err + ' ' + response.json.status,
        code: possibleCodes[response.json.status]
      })
    }
  })
}

module.exports = geocoder
