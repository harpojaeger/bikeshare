require('dotenv').config()
var chai = require('chai'),
expect = chai.expect


describe('Environment variables:', function() {
  it('Google Maps API key is set', function(done){
    expect(typeof process.env.GoogleMapsAPIKey, 'string')
    done()
  })
})
