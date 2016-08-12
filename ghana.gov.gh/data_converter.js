var DataConverter = function () {}

DataConverter.prototype.convertTelephone = function (value, dataObject) {
  var telephones = value.trim().split('  ')

  if (telephones !== null) {
    telephones = telephones.map(function (element) {
      return element.trim()
    })
    insertIntoDataObject('telephone', telephones, dataObject)
  }
}

DataConverter.prototype.convertName = function (name, dataObject) {
  var nameArray = name.trim().toLowerCase().split(/[^A-Za-z0-9]{1,}/)
  dataObject['name'] = nameArray.reduce(function (newName, value) {
    return newName + value.substring(0, 1).toUpperCase() + value.substring(1, value.length) + ' '
  }, '').trim()
}

DataConverter.prototype.convertWebsite = function (value, dataObject) {
  if (typeof value !== 'undefined') {
    var website = value.trim()

    if (website !== '') {
      dataObject['website'] = website
    }
  }
}

DataConverter.prototype.convertAddress = function (value, dataObject) {
  var address = value.trim()

  if (address !== '') {
    dataObject['address'] = address
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

module.exports = new DataConverter()
