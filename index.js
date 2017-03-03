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

// Internal API endpoint for finding bikeshare locations
var stations = require('./stations.js')
app.use('/stations',stations)

app.get('*', function(req, res) {
  res.send('Hello world.')
})

app.listen(port, function() {
  console.log('Node app is running on port', port)
})
