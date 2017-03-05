require('dotenv').config()
var assert = require('assert')
var xml = require('xml2js')
var app = require ('../index')
var supertest = require('supertest')('http://feeds.capitalbikeshare.com/stations/stations.xml')
var util = require('util')
describe('Capital Bikeshare', function() {
  afterEach(function(){
    if (this.currentTest.state == 'failed') {
      console.log("    Response body: " + util.inspect(response.body,{depth: null, colors: true}) + "\n");
    }
  })

  describe('XML', function() {
    it('returns 200', function(done) {
      supertest
      .get('')
      .expect(200)
      .end(done)
    })

    it('is version 2.0', function(done) {
      supertest
      .get('')
      .end(function(err, res) {
        var parser = new xml.Parser({explicitArray : false })
        parser.parseString(res.text, function(err, parsedXML) {
          assert.equal(parsedXML.stations['$'].version,'2.0')
          done()
        })
      })
    })
  })
})
