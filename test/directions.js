var app = require ('../index'),
    supertest = require('supertest')(app),
    chai = require('chai'),
    expect = chai.expect
chai.use(require('chai-json-schema'))

describe('The direction getter', function(){
  this.timeout(3000)
  this.slow(2000)
  it('responds to queries without start and end addresses with 400', function(done) {
    supertest.get('/directions')
    .expect(400, 'Provide both origin and destination addresses.')
    .end(done)
  })

  it('responds to queries with unresolvable origin addresses with 400', function(done) {
    supertest.get('/directions')
    .query({
      originAddr: 'Lorem ipsum dolor sit amet',
      destinationAddr: '1100 K St. NW, Washington DC'
    })
    .expect(400, 'Geocoding error: ZERO_RESULTS')
    .end(done)
  })

  it('responds to queries with unresolvable destination addresses with 400', function(done) {
    supertest.get('/directions')
    .query({
      originAddr: '1400 Shepherd St. NW, Washington DC',
      destinationAddr: 'Lorem ipsum dolor sit amet'
    })
    .expect(400, 'Geocoding error: ZERO_RESULTS')
    .end(done)
  })

  it('responds with JSON for all directions', function(done) {
    this.timeout(5000)
    this.slow(3000)
    // The JSON schema our directions must follow to be valid
    var directionsSchema = {
      title: 'walking & biking directions schema',
      type: 'object',
      properties: {
        walking: {
          type: 'object',
          properties: {
            fromOrigin: { type: 'object' },
            toDestination: { type: 'object' },
            required: ['fromOrigin','toDestination']
          }
        },
        biking: {
          type: 'object'
        }
      },
      required: ['walking', 'biking']
    }
    supertest.get('/directions')
    .query({
      originAddr: '1400 Randolph St. NW, Washington DC',
      destinationAddr: '1100 K St. NW, Washington DC'
    })
    .expect(200, function(err, res) {
      expect(JSON.parse(res.text)).to.be.jsonSchema(directionsSchema)
      done()
    })
  })
})
