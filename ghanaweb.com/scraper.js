var whacko = require('whacko')
var request = require('request')
var dataConverter = require('./data_converter.js')

function run (db, callbackScraper) {
  var counter = 0
  var policy = 300
  var numberOfPages = 0
  var scrapedPages = 0

  fetchPage('http://www.ghanaweb.com/GhanaHomePage/telephone_directory/category.php?ID=1150&page=1', getPageIds)

  function fetchPage (url, callback) {
    request(url, function (error, response, body) {
      if (error) {
        console.log('Error requesting page: ' + error)
        return
      }
      callback(body)
    })
  }

  function getPageIds (body) {
    var $ = whacko.load(body)
    var pages = []

    var navbarLinks = $('#medsection1 #pagination_bar .pagination a')

    var numberLastPage = 0

    navbarLinks.slice(navbarLinks.length - 2, navbarLinks.length - 1).each(function () {
      numberLastPage = $(this).text().trim()
    })

    for (var i = 1; i <= numberLastPage; i++) {
      pages.push('http://www.ghanaweb.com/GhanaHomePage/telephone_directory/category.php?ID=1150&page=' + i)
    }
    $ = undefined

    numberOfPages = numberLastPage - 1 * 10

    pages.forEach(function (link) {
      getPage(link)
    })
  }

  function getPage (link) {
    fetchPage(link, function (body) {
      var governments = []
      var $ = whacko.load(body)

      var governmentElements = $('#medsection1 div')
      governmentElements.slice(3, governmentElements.length - 3).each(function () {
        var detailedInformationLink = $(this).children('.lft').children('strong').children('a').attr('href')
        var type = []

        $(this).children('.categories').children('a').each(function () {
          type.push($(this).text())
        })
        if (typeof detailedInformationLink !== 'undefined') {
          governments.push({link: 'http://www.ghanaweb.com/GhanaHomePage/telephone_directory/' + detailedInformationLink, 'type': type})
        }
      })

      $ = undefined

      governments.forEach(function (governmentObject) {
        counter += policy
        setTimeout(function getPage () {
          console.log('ghanaweb.org - Get Page: ' + governmentObject.link)
          getGovermentDetailedInformation(governmentObject)
          scrapedPages += 1
          if (scrapedPages === numberOfPages) {
            if (typeof callbackScraper === 'function') {
              callbackScraper()
            }
          }
        }, counter)
      })
    })
  }

  function getGovermentDetailedInformation (governmentObject) {
    fetchPage(governmentObject.link, function (body) {
      var $ = whacko.load(body)

      var informationObject = {
        'name': '',
        'governmentType': governmentObject.type,
        'telephoneNumbers': [],
        'mobilephoneNumbers': [],
        'faxNumbers': [],
        'emailAddresses': [],
        'websites': [],
        'addresses': []
      }

      informationObject.name = $('#medsection1 h1').text().trim()

      $('.profile dl').children('dd').each(function (i, e) {
        var content = $(this).contents()

        Object.keys(content).forEach(function (key) {
          if (content[key].hasOwnProperty('name') && content[key].name === 'strong') {
            if (content[key].children[0].data === 'T') {
              // telephone
              informationObject.telephoneNumbers.push(content[key].next.data)
            } else if (content[key].children[0].data === 'M') {
              // mobilephone
              informationObject.mobilephoneNumbers.push(content[key].next.data)
            } else if (content[key].children[0].data === 'F') {
              // fax
              informationObject.faxNumbers.push(content[key].next.data)
            }
          } else if (content[key].hasOwnProperty('name') && content[key].name === 'script') {
            // email
            var data = content[key].children[0].data
            var email = data.match(/user = "(.*?)"/)[1] + '@' + data.match(/site = "(.*?)"/)[1]
            informationObject.emailAddresses.push(email)
          } else if (content[key].hasOwnProperty('name') && content[key].name === 'a') {
            // website
            informationObject.websites.push(content[key].attribs.href)
          } else if (!content[key].hasOwnProperty('name') && key === '0' && content[0].type === 'text') {
            // address
            informationObject.addresses.push(content[0].data)
            if (content.hasOwnProperty(2) && content[2].type === 'text') {
              informationObject.addresses.push(content[2].data)
            }
            if (content.hasOwnProperty(4) && content[4].type === 'text') {
              informationObject.addresses.push(content[4].data)
            }
          }
        })
      })

      $ = undefined

      db.insertRow(createDatabaseObject(informationObject))
    })
  }

  function createDatabaseObject (informationObject) {
    var databaseObject = {}

    dataConverter.convertName(informationObject.name, databaseObject)
    dataConverter.convertBuildingType(informationObject.governmentType, databaseObject)
    dataConverter.convertTelephone(informationObject.telephoneNumbers, databaseObject)
    dataConverter.convertMobilephone(informationObject.mobilephoneNumbers, databaseObject)
    dataConverter.convertFax(informationObject.faxNumbers, databaseObject)
    dataConverter.convertEmail(informationObject.emailAddresses, databaseObject)
    dataConverter.convertWebsite(informationObject.websites, databaseObject)
    dataConverter.convertAddress(informationObject.addresses, databaseObject)

    return databaseObject
  }
}

module.exports.run = run
