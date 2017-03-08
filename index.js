var express = require('express')
var app = express()
var bodyParser = require('body-parser')
app.use( bodyParser.json() )       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}))
require('dotenv').config()
var port = process.env.PORT || 5000

app.get('/favicon.ico', function(req, res) {
  res.send(null)
})

// Internal API endpoint for finding bikeshare locations
var stations = require('./app/stations')
app.use('/stations', function(req, res){
  stations(req.query.lat, req.query.long, req.query.minBikes || 0, req.query.minDocks || 0, function(err, results) {
    if (err) {
      res.status(err.code).send(err.text)
    } else {}
      res.send(results)
    }
  )
})

// Endpoint for calculating directions
var assembleDirections = require('./app/assembleDirections')
app.use('/directions', function(req, res) {
  debugger
  assembleDirections(req.query.originAddr, req.query.destinationAddr, function(err, results) {
    if (err) {
      res.status(err.code).send(err.text)
    } else {
      res.send(results)
    }
  })
})

app.get('/', function(req, res) {
  res.send('Hello world.')
})

app.get('*', function(req, res) {
  res.sendStatus(404)
})

app.listen(port, function() {
  console.log('Node app is running on port', port)
})

module.exports = app
