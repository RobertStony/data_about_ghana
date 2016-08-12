var whacko = require('whacko')
var request = require('request')
var dataConverter = require('./data_converter.js')

function run (db, callbackScraper) {
  console.log('ghana.gov.gh - http://www.ghana.gov.gh/index.php/governance/government-institutions')
  fetchPage('http://www.ghana.gov.gh/index.php/governance/government-institutions', getGovernmentInstitutions)

  function fetchPage (url, callback) {
    request(url, function (error, response, body) {
      if (error) {
        console.log('Error requesting page: ' + error)
        return
      }

      callback(body)
    })
  }

  function getGovernmentInstitutions (body) {
    var $ = whacko.load(body)

    $('table tbody').children().slice(1, 19).each(function () {
      var databaseObject = {}
      dataConverter.convertName($(this).children().slice(0, 1).text(), databaseObject)
      dataConverter.convertWebsite($(this).children('td').children('p').children('strong').children('a').attr('href'), databaseObject)
      dataConverter.convertAddress($(this).children('td').slice(1, 2).children('p').children('strong').eq(0).text(), databaseObject)
      databaseObject['building_type'] = 'government institution'
      dataConverter.convertTelephone($(this).children('td').slice(2, 3).text(), databaseObject)

      db.insertRow(databaseObject)
    })
    if (typeof callbackScraper === 'function') {
      callbackScraper()
    }
    $ = undefined
  }
}

module.exports.run = run
