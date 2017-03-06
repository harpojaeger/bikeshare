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
var stations = require('./app/stations.js')
app.use('/stations', function(req, res){
  debugger
  stations(req.query.addr, req.query.minBikes || 0, req.query.minDocks || 0, function(err, results) {
    debugger
    if (err) {
      res.status(err.code).send(err.text)
    } else {}
      res.send(results)
    }
  )
})

// Endpoint for calculating directions
var directions = require('./app/assembleDirections.js')
app.use('/directions', directions)

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
