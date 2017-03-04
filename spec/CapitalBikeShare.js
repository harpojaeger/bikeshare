// Tests to make sure the Capital Bikeshare data is working.
var request = require('request')
var xml = require('xml2js')

describe('Capital Bikeshare', function() {
  describe('GET XML', function(){
    it('returns status code 200', function() {
      request.get('http://feeds.capitalbikeshare.com/stations/stations.xml', function(error, response, body) {
        expect(response.statusCode).toBe(200)
        done()
      })
    })
    it('is version 2.0', function() {
      request.get('http://feeds.capitalbikeshare.com/stations/stations.xml', function(error, response, body) {
        var parser = new xml.Parser({explicitArray : false })
        parser.parseString(body, function(err, result) {
          expect(result.stations.version).toBe('2.0')
          done()
        })
      })
    })
  })
})
