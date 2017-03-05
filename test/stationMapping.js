require('dotenv').config()
var assert = require('assert')
var app = require ('../index')
var supertest = require('supertest')(app)

describe('The closest bikeshare station to', function() {
  describe('the shtetl', function() {
    it('is 14th & Upshur', function(done){
      supertest.get('/stations')
      .query({ addr: '1400 Shepherd St. NW, Washington DC' })
      .expect(200, function(err, res){
        assert.equal(parseInt(JSON.parse(res.text)[0].id),217)
        done()
      })
    })
  })

  describe('Merdian Pint', function(){
    it('is 11th & Kenyon', function(done) {
      supertest.get('/stations')
      .query({ addr: '3400 11th St NW, Washington, DC' })
      .expect(200, function(err, res){
        assert.equal(parseInt(JSON.parse(res.text)[0].id),16)
        done()
      })
    })
  })
})
