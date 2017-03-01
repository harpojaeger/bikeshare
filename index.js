var express = require('express')
app = express()
var bodyParser = require('body-parser')
app.use( bodyParser.json() )       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}))
var port = process.env.PORT || 5000

app.get('/favicon.ico', function(req, res) {
  res.send(null)
})

var regions = require('./regions')

// Internal API endpoint for finding bikeshare near the origin.
app.get('/find/origins', function(req, res) {
  var addr = req.query.addr
  res.send(addr)
})

// Internal API endpoint for finding bikeshare near the destination.
app.get('/find/destinations', function(req, res) {
  var addr = req.query.addr
  res.send(addr)
})

app.get('*', function(req, res) {
  res.send('Hello world.')
})

app.listen(port, function() {
  console.log('Node app is running on port', port)
})
