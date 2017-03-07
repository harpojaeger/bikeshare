var GoogleMapsAPIKey = process.env.GoogleMapsAPIKey
var googleMapsClient = require('@google/maps').createClient({
  key: GoogleMapsAPIKey
});

var directions = function(originAddr, destinationAddr, mode, cb) {
  debugger
  googleMapsClient.directions({
    origin: originAddr,
    destination: destinationAddr,
    mode: mode
  }, function(err, response) {
    if(!err && response.json.status == 'OK') {
      debugger
      cb(null, response.json)
    } else {
      var possibleCodes = {
        // NOT_FOUND means one of the pts couldn't be geocoded – it's not really a 404
        'NOT_FOUND' : 400,
        'ZERO_RESULTS' : 400,
        'MAX_WAYPOINTS_EXCEEDED' : 413,
        'MAX_ROUTE_LENGTH_EXCEEDED' : 413,
        'INVALID_REQUEST' : 400,
        'OVER_QUERY_LIMIT' : 429,
        'REQUEST_DENIED' : 403,
        'UNKNOWN_ERROR' : 500,
      }
      console.error(response.json)
      cb({
        text: 'Error geocoding address: ' + err + ' ' + response.json.status,
        code: possibleCodes[response.json.status]
      })
    }
  })
}

module.exports = directions
