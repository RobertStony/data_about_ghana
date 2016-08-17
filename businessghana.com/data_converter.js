var replaceall = require('replaceall')

var DataConverter = function () {}

DataConverter.prototype.convertTelephone = function (value, dataObject) {
  var telephone = getOrElse(value, ['']).reduce(function (newTelephone, element) {
    return newTelephone + ' ' + element.trim()
  }, '').trim()

  if (telephone !== '' && telephone.match(/.*\d.*/)) {
    dataObject['telephone'] = telephone
  }
}

DataConverter.prototype.convertFax = function (value, dataObject) {
  var fax = getOrElse(value, ['']).reduce(function (newFax, element) {
    return newFax + ' ' + element.trim()
  }, '').trim()

  if (fax !== '' && fax.match(/.*\d.*/)) {
    dataObject['fax'] = fax
  }
}

DataConverter.prototype.convertEmail = function (value, dataObject) {
  var email = getOrElse(value, [''])
  email = resolveMultipleEntries(email, '/', ' ')

  email = email.filter(function (element) {
    return element.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
  }, '')

  if (email.length > 0) {
    insertIntoDataObject('email', email, dataObject)
  }
}

DataConverter.prototype.convertWebsite = function (value, dataObject) {
  var website = getOrElse(value, ['']).reduce(function (newWebsite, element) {
    return newWebsite + ' ' + element.trim()
  }, '').trim()

  var isWebsite = website.match(/(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/)

  if (isWebsite) {
    dataObject['website'] = website
  }
}

DataConverter.prototype.convertAddress = function (value, dataObject) {
  var address = getOrElse(value, ['']).reduce(function (newAddress, element) {
    return newAddress + element.trim() + '\n'
  }, '').trim()

  var isAddress = address.match(/.*[a-zA-Z].*/)

  if (isAddress && address !== '' && address.toLowerCase() !== 'n/a' && address.toLowerCase() !== 'none') {
    dataObject['address'] = address
  }
}

DataConverter.prototype.convertRegion = function (value, dataObject) {
  var region = getOrElse(value, ['']).reduce(function (newRegion, element) {
    return newRegion + element.trim() + '\n'
  }, '').trim()

  var isRegion = region.match(/.*[a-zA-Z].*/)

  if (isRegion && region !== '' && region.toLowerCase() !== 'n/a' && region.toLowerCase() !== 'none') {
    dataObject['region'] = region
  }
}

DataConverter.prototype.convertLocation = function (value, dataObject) {
  var location = getOrElse(value, ['']).reduce(function (newLocation, element) {
    return newLocation + element.trim() + '\n'
  }, '').trim()

  var isLocation = location.match(/.*[a-zA-Z].*/)

  if (isLocation && location !== '' && location.toLowerCase() !== 'n/a' && location.toLowerCase() !== 'none') {
    dataObject['location'] = location
  }
}

function insertIntoDataObject (key, values, dataObject) {
  if (values.length > 1) {
    dataObject[key] = values.shift()
    values.forEach(function (element, index) {
      dataObject[key + (index + 2)] = element
    })
  } else if (values.length === 1) {
    dataObject[key] = values[0]
  } else {
  }
}

function getOrElse (value, elseValue) {
  if (typeof value === 'undefined' || value === null) {
    return elseValue
  } else {
    return value
  }
}

function resolveMultipleEntries (array, replaceString, replaceWith) {
  return array.reduce(function (newArr, value) {
    var multipleEntries = replaceall(replaceString, replaceWith, value)
    if (multipleEntries !== value) {
      return newArr.concat(multipleEntries.split(' '))
    }
    return newArr.concat(value)
  }, [])
}

module.exports = new DataConverter()
