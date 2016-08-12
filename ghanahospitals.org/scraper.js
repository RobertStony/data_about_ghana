var whacko = require('whacko')
var request = require('request')
var dataconverter = require('./data_converter.js')

function run (db) {
  var counter = 0
  var policy = 300
  fetchPage('http://ghanahospitals.org/home/', getRegion)

  function fetchPage (url, callback) {
    request(url, function (error, response, body) {
      if (error) {
        console.log('Error requesting page: ' + error)
        return
      }

      callback(body)
    })
  }

  function getRegion (body) {
    var regionObject = {}
    var $ = whacko.load(body)

    $('#nav li').slice(9).each(function () {
      regionObject[$(this).text().trim()] = $(this).children('a').attr('href').substring(2)
    })

    $ = undefined

    Object.keys(regionObject).forEach(function (region) {
      getDistrict(region, regionObject[region])
    })
  }

  function getDistrict (region, link) {
    fetchPage('http://ghanahospitals.org' + link, function (body) {
      var districtObject = {}
      var $ = whacko.load(body)

      $('.side_district').each(function () {
        districtObject[$(this).text().trim()] = $(this).children('a').attr('href').substring(2)
      })

      $ = undefined

      Object.keys(districtObject).forEach(function (district) {
        getHospital(region, district, districtObject[district])
      })
    })
  }

  function getHospital (region, district, link) {
    fetchPage('http://ghanahospitals.org' + link, function (body) {
      var hospitalArray = []
      var $ = whacko.load(body)

      $('.fbox_2').each(function () {
        hospitalArray.push($(this).children('a').attr('href').substring(2))
      })

      $ = undefined

      hospitalArray.forEach(function (link) {
        counter += policy
        setTimeout(function getPage () {
          console.log('ghanahospitals.org - Get Page: ' + link)
          getHospitalInfo(region, district, link)
        }, counter)
      })
    })
  }

  function getHospitalInfo (region, district, link) {
    fetchPage('http://ghanahospitals.org' + link, function (body) {
      var $ = whacko.load(body)
      $('.fdtails_home').each(function () {
        var data = $(this).text().trim()
        db.insertRow(createDatabaseObject(region, district, data))
      })
      $ = undefined
    })
  }

  function createDatabaseObject (region, district, data) {
    var databaseObject = {}
    var dataSplit = data.split('\n')
    dataconverter.convertName('name', dataSplit.shift(), databaseObject)
    databaseObject['region'] = region
    databaseObject['district'] = district
    dataSplit.forEach(function (value) {
      if (value.trim() !== '') {
        var element = value.split(':')
        dataconverter.convertTelephone(element[0], element[1], databaseObject)
        dataconverter.convertBuildingType(element[0], element[1], databaseObject)
        dataconverter.convertLocation(element[0], element[1], databaseObject)
      }
    })
    return databaseObject
  }
}
module.exports.run = run
