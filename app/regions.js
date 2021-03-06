// Load data based on which region

module.exports = {
  match: function(orig, dest) {
    return ( orig.region === des.region )
  },
  data: function(region) {
    var regionalData = {
      'DC' : {
        'slug' : 'DC',
        'fullname' : 'Washington, DC',
        'apis' : {
          'endpoint' : 'http://feeds.capitalbikeshare.com/stations/stations.xml',
          'auth' : false,
          'method' : 'GET',
          'format' : 'XML'
        }
      }
    }
    return regionalData[region]
  },
  compute: function(addr) {
    // Do some stuff to figure out what region a given address is in.
  }
}
