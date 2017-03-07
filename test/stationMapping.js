var assert = require('assert')
var app = require ('../index')
var supertest = require('supertest')(app)

describe('The closest bikeshare station to', function() {
  this.timeout(5000)
  this.slow(3000)
  describe('the shtetl', function() {
    it('is 14th & Upshur', function(done){
      supertest.get('/stations')
      .query({
        lat: 38.9397491,
        long: -77.0327219
      })
      .expect(200, function(err, res){
        assert.equal(parseInt(JSON.parse(res.text)[0].id),217)
        done()
      })
    })
  })

  describe('Merdian Pint', function(){
    it('is 11th & Kenyon', function(done) {
      supertest.get('/stations')
      .query({
        lat: 38.9319963,
        long: -77.0285086
      })
      .expect(200, function(err, res){
        assert.equal(parseInt(JSON.parse(res.text)[0].id),16)
        done()
      })
    })
  })
})
