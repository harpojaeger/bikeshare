var assert = require('assert')
var app = require ('../index')
var supertest = require('supertest')(app)

describe('HTTP server', function() {
  it('responds with Hello World at root', function(done) {
    supertest.get('/')
    .expect(200)
    .expect('Hello world.')
    .end(done)
  })
  it('responds with 404 at other paths', function(done) {
    supertest.get('/foo/bar')
    .expect(404)
    .end(done)
  })
})
