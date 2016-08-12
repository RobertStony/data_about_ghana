var whacko = require('whacko')
var request = require('request')
var dataConverter = require('./data_converter.js')

function run (db, callbackScraper) {
  var counter = 0
  var policy = 300
  var numberOfPages = 0
  var scrapedPages = 0

  fetchPage('http://www.graduates.com/Schools/Ghana', getRegion)

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
    var $ = whacko.load(body)
    var region = []

    var districtLinks = $('.col-lg-12').children('ul').eq(1).children('li')

    districtLinks.each(function () {
      region.push('http://www.graduates.com/' + $(this).children('a').attr('href'))
    })

    $ = undefined

    getDistricts(region[0])

    region.forEach(function (link) {
      // console.log(getDistricts(link))
      // getPage(link)
    })
  }

  function getDistricts (link) {
    fetchPage(link, function (body) {
      var districts = []
      var $ = whacko.load(body)

      $('.col-lg-12').children('ul').eq(1).children('li').each(function () {
        districts.push('http://www.graduates.com/' + $(this).children('a').attr('href'))
      })

      $ = undefined
      getSchools(districts[2])
      districts.forEach(function (link) {})
    })
  }

  function getSchools (link) {
    fetchPage(link, function (body) {
      var schools = []
      var $ = whacko.load(body)

      $('.col-lg-12').children('ul').eq(1).children('li').each(function () {
        schools.push('http://www.graduates.com/' + $(this).children('a').attr('href'))
      })

      $ = undefined
      getSchoolInfo(schools[0])
      schools.forEach(function (link) {
        setTimeout(function getPage () {
          console.log('graduates.com - Get Page: ' + link)
          getSchoolInfo(link)
        }, counter)
      // getSchoolInfo(link)
      })
    })
  }

  function getSchoolInfo (link) {
    fetchPage(link, function (body) {
      var $ = whacko.load(body)

      var informationObject = {
        'name': '',
        'building_type': 'school',
        'region': '',
        'city': '',
        'address': ''
      }

      var infoPanel = $('.panel-body.text-muted').children('div')
      informationObject.name = infoPanel.eq(0).children('span').filter(function (i, el) {
        return $(this).attr('itemprop') === 'name'
      }).text()

      informationObject.address = infoPanel.eq(1).children('div').children('span').filter(function (i, el) {
        return $(this).attr('itemprop') === 'streetAddress'
      }).text()

      informationObject.city = infoPanel.eq(1).children('div').children('span').filter(function (i, el) {
        return $(this).attr('itemprop') === 'addressLocality'
      }).text()

      informationObject.region = infoPanel.eq(1).children('div').children('span').filter(function (i, el) {
        return $(this).attr('itemprop') === 'addressRegion'
      }).text()
      $ = undefined

      db.insertRow(informationObject)
    })
  }
}

module.exports.run = run
