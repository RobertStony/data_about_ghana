var whacko = require('whacko')
var request = require('request')
var dataConverter = require('./data_converter.js')

function run (db, callbackScraper) {
  var counter = 0
  var policy = 300
  var numberOfPages = 0
  var scrapedPages = 0

  fetchPage('http://www.businessghana.com/portal/directory/index.php?op=getSubDirectories&category=&id=2', getCategories, callbackScraper)

  function fetchPage (url, callback, callbackScraper) {
    request(url, function (error, response, body) {
      if (error) {
        console.log('Error requesting page: ' + error)
        return
      }

      callback(body, callbackScraper)
    })
  }

  function getCategories (body, callbackScraper) {
    var $ = whacko.load(body)

    var categories = []

    $('div .directoryList').each(function () {
      numberOfPages += parseInt($(this).parent('div').text().trim().match(/.*\[(\d{1,3})\].*/)[1])
      categories.push(
        {'link': 'http://www.businessghana.com/portal/' + $(this).attr('href'),
          'type': $(this).text().trim()
        })
    })

    $ = undefined

    Object.keys(categories).forEach(function (key) {
      getLinks(categories[key], callbackScraper)
    })
  }

  function getLinks (categoriesObject, callbackScraper) {
    fetchPage(categoriesObject.link, function (body) {
      var $ = whacko.load(body)

      var navbarLinks = []

      $('a').each(function () {
        var href = $(this).attr('href')
        if (/offset=(\d*)/.test(href)) {
          navbarLinks.push('http://www.businessghana.com/portal/' + href)
        }
      })

      $ = undefined

      navbarLinks.pop()
      navbarLinks.push(categoriesObject.link)

      navbarLinks.forEach(function (link) {
        categoriesObject['link'] = link
        getCompanies(categoriesObject, callbackScraper)
      })
    })
  }

  function getCompanies (companiesObject, callbackScraper) {
    fetchPage(companiesObject.link, function (body) {
      var $ = whacko.load(body)

      var companies = []

      $('.directoryList').each(function () {
        companies.push({
          'link': 'http://www.businessghana.com/portal/' + $(this).attr('href'),
          'type': companiesObject.type, 'name': $(this).text().trim()
        })
      })

      $ = undefined

      companies.forEach(function (companyObject) {
        counter += policy
        setTimeout(function getPage () {
          console.log('businessghana.com - Get Page: ' + companyObject.link)
          getCompaniesInformation(companyObject)
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

  function getCompaniesInformation (companyObject) {
    fetchPage(companyObject.link, function (body) {
      var $ = whacko.load(body)

      var informationObject = {
        'name': companyObject.name,
        'type': companyObject.type,
        'telephoneNumbers': [],
        'faxNumbers': [],
        'emailAddresses': [],
        'websites': [],
        'addresses': [],
        'region': [],
        'location': []
      }

      var information = $('table').filter(function (i, el) {
        return $(this).attr('width') === '90%' && $(this).attr('cellpadding') === '3' && $(this).attr('cellspacing') === '2'
      })

      information.each(function () {
        var content = $(this).text().split('\n')

        content = content.reduce(function (newArray, element) {
          var newElement = element.trim()
          if (newElement !== '') {
            newArray.push(newElement)
          }
          return newArray
        }, [])

        var prevElement = ''
        for (var i = 0; i < content.length; i++) {
          if (i === 0) {
            prevElement = content[i]
          } else if (content[i] === ':') {
          } else if (content[i] === 'Website') {
            prevElement = 'Website'
          } else if (content[i] === 'Address') {
            prevElement = 'Address'
          } else if (content[i] === 'Location') {
            prevElement = 'Location'
          } else if (content[i] === 'Region') {
            prevElement = 'Region'
          } else if (content[i] === 'Email') {
            prevElement = 'Email'
          } else if (content[i] === 'Phone') {
            prevElement = 'Phone'
          } else if (content[i] === 'Fax') {
            prevElement = 'Fax'
          } else {
            if (prevElement === 'Website') {
              informationObject.websites.push(content[i])
            } else if (prevElement === 'Address') {
              informationObject.addresses.push(content[i])
            } else if (prevElement === 'Location') {
              informationObject.location.push(content[i])
            } else if (prevElement === 'Region') {
              informationObject.region.push(content[i])
            } else if (prevElement === 'Email') {
              informationObject.emailAddresses.push(content[i])
            } else if (prevElement === 'Phone') {
              informationObject.telephoneNumbers.push(content[i])
            } else if (prevElement === 'Fax') {
              informationObject.faxNumbers.push(content[i])
            }
          }
        }
        db.insertRow(createDatabaseObject(informationObject))
      })
      $ = undefined
    })
  }

  function createDatabaseObject (informationObject) {
    var databaseObject = {}

    databaseObject['name'] = informationObject.name
    databaseObject['building_type'] = informationObject.type
    dataConverter.convertTelephone(informationObject.telephoneNumbers, databaseObject)
    dataConverter.convertFax(informationObject.faxNumbers, databaseObject)
    dataConverter.convertEmail(informationObject.emailAddresses, databaseObject)
    dataConverter.convertWebsite(informationObject.websites, databaseObject)
    dataConverter.convertAddress(informationObject.addresses, databaseObject)
    dataConverter.convertRegion(informationObject.region, databaseObject)
    dataConverter.convertLocation(informationObject.location, databaseObject)

    return databaseObject
  }
}
module.exports.run = run
