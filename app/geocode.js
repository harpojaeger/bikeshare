var GoogleMapsAPIKey = process.env.GoogleMapsAPIKey
var googleMapsClient = require('@google/maps').createClient({
  key: GoogleMapsAPIKey
});

var nodeGeocoder = require('node-geocoder')
var geocoder = nodeGeocoder({
  provider: 'google',
  apiKey: GoogleMapsAPIKey
})

var newGeocoder = function(addresses, cb) {
  geocoder.batchGeocode(addresses)
  .then(function(res){
    cb(null, res)
  })
  .catch(function(err) {
    // Return slightly more descriptive status codes based on what we get back from the Google Maps API
    var possibleCodes = {
      'ZERO_RESULTS' : 400,
      'INVALID_REQUEST' : 400,
      'OVER_QUERY_LIMIT' : 429,
      'REQUEST_DENIED' : 403,
      'UNKNOWN_ERROR' : 500,
    }
    console.error(err)
    cb({
      // fix these
      text: 'Error geocoding address: ' + err + ' ' ,
      code: possibleCodes[err]
    })
  })
}




var oldGeocoder = function(queryAddr, cb) {
  googleMapsClient.geocode({
    address: queryAddr
  }, function(err, response){
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
      console.error(response.json)
      cb({
        text: 'Error geocoding address: ' + err + ' ' + response.json.status,
        code: possibleCodes[response.json.status]
      })
    }
  })
}

module.exports = {
  new: newGeocoder,
  old: oldGeocoder
}
