var replaceall = require('replaceall')

var DataConverter = function () {}

DataConverter.prototype.convertTelephone = function (key, value, dataObject) {
  var telephoneArray = []
  switch (key.trim().toLowerCase()) {
    case 'tel':
      telephoneArray.push(replaceall('o', '0', value.trim().toLowerCase()))
      break
  }
  if (telephoneArray.length !== 0) {
    telephoneArray = resolveMultipleEntries(telephoneArray, '/', ' ')
    telephoneArray = filterDuplicates(telephoneArray)
    insertIntoDataObject('telephone', telephoneArray, dataObject)
  }
}

DataConverter.prototype.convertBuildingType = function (key, value, dataObject) {
  var buildingArray = []
  switch (key.trim().toLowerCase()) {
    case 'type':
      buildingArray.push(value.trim())
      break
  }

  if (buildingArray.length !== 0) {
    dataObject['type'] = buildingArray[0]
  }
}

DataConverter.prototype.convertName = function (key, value, dataObject) {
  var nameArray = []
  switch (key.trim().toLowerCase()) {
    case 'name':
      nameArray.push(convertName(value))
      break
  }

  if (nameArray.length !== 0) {
    dataObject['name'] = nameArray[0]
  }
}

DataConverter.prototype.convertService = function (key, value, dataObject) {
  var service = []
  switch (key.trim().toLowerCase()) {
    case 'services':
      service.push(value.trim())
      break
  }

  if (service.length !== 0) {
    dataObject['service'] = service[0]
  }
}

function convertName (name) {
  var nameArray = name.trim().toLowerCase().split(/[^A-Za-z0-9]{1,}/)
  return nameArray.reduce(function (newName, value) {
    return newName + value.substring(0, 1).toUpperCase() + value.substring(1, value.length) + ' '
  }, '').trim()
}

DataConverter.prototype.convertWebsite = function (key, value, dataObject) {
  var websiteArray = []
  switch (key.trim().toLowerCase()) {
    case 'website':
      websiteArray.push(value.trim())
      break
  }

  if (websiteArray.length !== 0) {
    dataObject['website'] = websiteArray[0]
  }
}

DataConverter.prototype.convertLocation = function (key, value, dataObject) {
  var districtArray = []
  var regionArray = []
  var locationArray = []

  switch (key.trim().toLowerCase()) {
    case 'district':
      districtArray.push(value)
      break
    case 'region':
      regionArray.push(value)
      break
    case 'location':
      locationArray.push(convertName(value))
      break
  }

  if (districtArray.length !== 0) {
    dataObject['district'] = districtArray[0]
  }

  if (regionArray.length !== 0) {
    dataObject['region'] = regionArray[0]
  }

  if (locationArray.length !== 0) {
    dataObject['city'] = locationArray[0]
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

function filterDuplicates (array) {
  return array.filter(function (element, index, arr) {
    return arr.indexOf(element) === index
  })
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
