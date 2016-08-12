var DatabaseUtility = require('./database_utility.js')
var osmGhanaScraper = require('./overpass-turbo.eu/scraper.js')
var GhanaHospitalsScraper = require('./ghanahospitals.org/scraper.js')
var ghanaweb = require('./ghanaweb.com/scraper.js')
var ghanaGov = require('./ghana.gov.gh/scraper.js')
var businessGhana = require('./businessghana.com/scraper.js')
var graduates = require('./graduates.com/scraper.js')

var model = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  latitude: 'TEXT',
  longitude: 'TEXT',
  name: 'TEXT',
  building_type: 'TEXT',
  telephone: 'TEXT',
  telephone2: 'TEXT',
  telephone3: 'TEXT',
  telephone4: 'TEXT',
  telephone5: 'TEXT',
  mobilephone: 'TEXT',
  mobilephone2: 'TEXT',
  mobilephone3: 'TEXT',
  mobilephone4: 'TEXT',
  mobilephone5: 'TEXT',
  fax: 'TEXT',
  fax2: 'TEXT',
  fax3: 'TEXT',
  fax4: 'TEXT',
  fax5: 'TEXT',
  website: 'TEXT',
  website2: 'TEXT',
  website3: 'TEXT',
  website4: 'TEXT',
  website5: 'TEXT',
  email: 'TEXT',
  email2: 'TEXT',
  email3: 'TEXT',
  email4: 'TEXT',
  email5: 'TEXT',
  opening_hours: 'TEXT',
  postcode: 'TEXT',
  house_number: 'TEXT',
  street_name: 'TEXT',
  region: 'TEXT',
  district: 'TEXT',
  city: 'TEXT',
  address: 'TEXT',
  address_additional: 'TEXT',
  geo_json: 'BLOB'
}

var db = new DatabaseUtility(model)

db.deleteDatabase(prepareDatabase)

function prepareDatabase () {
  db.createDatabase(runScrapers)
}

function runScrapers () {
  osmGhanaScraper.run(db, runGhanaweb)
}

function runGhanaweb () {
  ghanaweb.run(db, runGhanaGov)
}

function runGhanaGov () {
  ghanaGov.run(db, runBusinessGhana)
}

function runBusinessGhana () {
  businessGhana.run(db, function () {
    GhanaHospitalsScraper.run(db)
  })
}
