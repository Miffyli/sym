// Path to datafile
const BF1_DATA = './pages/bf1/data/bf1_1.json'

// Manual dates when the data or pages have been modified.
// In format "[day] [month three letters] [year four digits]"
// e.g. 2nd Jan 2019
const BF1_DATA_DATE = '2nd Nov 2019 (BF1_I)'
const BF1_PAGE_DATE = '2nd Jan 2020'

// Total version string displayed under title
const BF1_VERSION_STRING = `Latest updates<br>Page: ${BF1_PAGE_DATE}<br>Data: ${BF1_DATA_DATE}`

// Constants for BF1
// Constants for plotting damage/ttk/etc
const BF1_DAMAGE_RANGE_START = 0
const BF1_DAMAGE_RANGE_END = 120
const BF1_DAMAGE_RANGE_STEP = 1

// Minimum damage multiplier (9.1.2018)
const BF1_MIN_DAMAGE_MULTIPLIER = 1.0

// Set of variables that should be considered worse
// if the number is lower
const BF1_LOWER_IS_WORSE = new Set([
    'SDmg',
    'EDmg',
    'RoF',
    'BRoF',
    'MagSize',
    'InitialSpeed',
    'TimeToLive',
    'MaxDistance',
    'ADSRecoilDec',
    'HIPRecoilDec',
    'ADSStandBaseSpreadDec',
    'HIPStandBaseSpreadDec',
    'ADSCrouchBaseSpreadDec',
    'HIPCrouchBaseSpreadDec',
    'ADSProneBaseSpreadDec',
    'HIPProneBaseSpreadDec',
    'ADSStandMoveSpreadDec',
    'HIPStandMoveSpreadDec',
    'ADSCrouchMoveSpreadDec',
    'HIPCrouchMoveSpreadDec',
    'ADSProneMoveSpreadDec',
    'HIPProneMoveSpreadDec',
    "ADSStandBaseSpreadDec",
    "ADSProneRecoilDec",
    "ADSStandRecoilDec",
    "ADSCrouchRecoilDec",
    "ADSRecoilDec",
    "HeatClipSize",
    "FirstShotHIPSpreadMul",
    "FirstShotADSSpreadMul",
    "ShotsPerShell"
])

// A flag to tell if we have loaded BF1 data already
var BF1DataLoaded = false
// This will be the main holder of all the weapon data.
// An array of dictionaries, each of which is a weapon
var BF1WeaponData = []
// This will be similar to data, except
// keys are the full weapon names (with attachments)
// and values are the weapons
var BF1WeaponNameToData = {}
// This will be all the keys available per weapon
// (i.e. variable names)
var BF1WeaponKeys = []
// Variable name -> array, where indexing is same as in
// BF1WeaponData
var BF1WeaponKeyToData = {}
// Keeps track of which page to load after the data is loaded.
var BF1SelectedPage = ""
// Keeps track of which page to load when loading from a querystring
var bf1PageToLoad = ""

/*
  Returns html RGB color code for given array
  Nicked from Stackoverflow #41310869
*/
function BF1ArrayToRGB(values) {
  return 'rgb(' + values.join(', ') + ')';
}

/*
  Interpolate color between two arrays.
  `ratio` specifies how much "rgb2" is in the color
*/
function BF1InterpolateRGB(rgb1, rgb2, ratio) {
  return rgb1.map((rgb1Val, i) => rgb1Val + (rgb2[i] - rgb1Val) * ratio)
}

/*
  Return weapon's damage at given point dist.
  damages and distances specify how much weapon
  does damage at those points, and everything
  else is linearly interpolated between.
*/
function BF1InterpolateDamage (dist, damages, distances) {
  if (dist <= Math.min.apply(null, distances)) {
    return damages[0]
  } else if (dist >= Math.max.apply(null, distances)) {
    return damages[damages.length - 1]
  } else {
    // Find the neighboring points
    var prevDist = undefined
    var nextDist = undefined
    var prevDmg = undefined
    var nextDmg = undefined
    for (var i = 0; i < distances.length; i++) {
      if (dist >= distances[i]) {
        prevDist = distances[i]
        prevDmg = damages[i]
        nextDist = distances[i + 1]
        nextDmg = damages[i + 1]
      }
    }
    // Interpolate the two
    var interpolated = prevDmg + ((dist - prevDist) / (nextDist - prevDist)) * (nextDmg - prevDmg)
    return interpolated
  }
}

/*
  Return array of [distance, damage],
  where length of the array is based on constants
  defined above
*/
function BF1GetDamageOverDistance (weapon) {
  var damages = weapon['Damages']
  var distances = weapon['Dmg_distances']
  var damageOverDistance = []

  // Loop over distance and store damages
  for (var dist = BF1_DAMAGE_RANGE_START; dist <= BF1_DAMAGE_RANGE_END; dist += BF1_DAMAGE_RANGE_STEP) {
    damageOverDistance.push([dist, BF1InterpolateDamage(dist, damages, distances)])
  }
  return damageOverDistance
}

/*
  Return array of [distance, bullets],
  where length of the array is based on constants
  defined above
*/
function BF1GetBTKUpperBoundOverDistance (weapon) {
  var damages = weapon['Damages']
  var distances = weapon['Dmg_distances']
  var BTKUBOverDistance = []

  // Loop over distance and store damages
  var damageAtDist = 0
  for (var dist = BF1_DAMAGE_RANGE_START; dist <= BF1_DAMAGE_RANGE_END; dist += BF1_DAMAGE_RANGE_STEP) {
    damageAtDist = BF1InterpolateDamage(dist, damages, distances)
    BTKUBOverDistance.push([dist, Math.ceil(100 / (damageAtDist * BF1_MIN_DAMAGE_MULTIPLIER))])
  }
  return BTKUBOverDistance
}

/*
  Return array of [distance, milliseconds],
  where length of the array is based on constants
  defined above
*/
function BF1GetTTKUpperBoundOverDistance (weapon) {
  var damages = weapon['Damages']
  var distances = weapon['Dmg_distances']
  var bulletVelocity = weapon['InitialSpeed']
  var bulletDrag = weapon['Drag']
  var numShots = weapon['ShotsPerShell']
  var msPerShot = 60000 / (weapon['RoF'])
  var TTKUBOverDistance = []

  // Loop over distance and store damages
  var damageAtDist = 0
  var msToTarget = 0
  var bulletsToKill = 0
  // Used to track how long bullet has been flying
  var bulletFlightSeconds = 0.0
  for (var dist = BF1_DAMAGE_RANGE_START; dist <= BF1_DAMAGE_RANGE_END; dist += BF1_DAMAGE_RANGE_STEP) {
    damageAtDist = BF1InterpolateDamage(dist, damages, distances) * numShots
    // Floor because we do not need the last bullet
    // Small epsilon is added to fix situation with 100 damage (100 / 100 = 1)
    bulletsToKill = Math.floor(100 / (damageAtDist * BF1_MIN_DAMAGE_MULTIPLIER + 0.00001))

    msToTarget = bulletFlightSeconds * 1000
    // Update bullet velocity and time we are flying
    bulletFlightSeconds += BF1_DAMAGE_RANGE_STEP / bulletVelocity
    // Update according to drag
    bulletVelocity -= (Math.pow(bulletVelocity, 2) * bulletDrag) * (BF1_DAMAGE_RANGE_STEP / bulletVelocity)

    // The only time from bullet flight comes from the last bullet that lands on the enemy,
    // hence we only add msToTarget once
    TTKUBOverDistance.push([dist, bulletsToKill * msPerShot + msToTarget])
  }
  return TTKUBOverDistance
}

/*
  Function to handle JSON data upon receiving it:
  Parse JSON data and preprocess it into different
  arrays.
*/
function BF1LoadSuccessCallback (data) {
  BF1WeaponData = data
  // Create name_to_data objects
  for (var i = 0; i < BF1WeaponData.length; i++) {
    BF1WeaponNameToData[BF1WeaponData[i]['WeapShowName']] = BF1WeaponData[i]
  }
  // All weapons should have same keys.
  // Take keys from the first weapon and store them as keys
  BF1WeaponKeys = Object.keys(BF1WeaponData[0])
  // Sort keys for consistency between runs etc
  BF1WeaponKeys.sort()

  // Create BF1WeaponKeyToData
  var key
  for (var keyi = 0; keyi < BF1WeaponKeys.length; keyi++) {
    key = BF1WeaponKeys[keyi]
    var dataRow = []
    for (var weapi = 0; weapi < BF1WeaponData.length; weapi++) {
      dataRow.push(BF1WeaponData[weapi][key])
    }
    BF1WeaponKeyToData[key] = dataRow
  }
  BF1DataLoaded = true

  // Proceed to appropriate page
  if (BF1SelectedPage === "BF1_CHART"){
    loadBF1ChartPage()
  } else if (BF1SelectedPage === "BF1_COMPARISON"){
    loadBF1ComparisonPage()
  }
}

/*
  Load BF1 data from the JSON file, and parse it
  into the global variables
*/
function BF1LoadWeaponData () {
  // TODO Add some kind of progress bar here?
  $.getJSON(BF1_DATA).done(BF1LoadSuccessCallback).fail(function (jqxhr, textStatus, error) {
    console.log('Loading BF1 data failed: ' + textStatus + ' , ' + error)
  })
}

/*
  Load the BF1 selector page that contains the buttons to allow
  the user to select which page to navigate to (chart, comp, etc...).
*/
function openBF1SelectionPage () {
  loadPageWithHeader('./pages/bf1/bf1_header.html', 'Battlefield 1', initializeBF1Selection, BF1_VERSION_STRING)
}

function openBF1SelectionPageFromQueryString (pageStr){
  bf1PageToLoad = pageStr
  loadPageWithHeader('./pages/bf1/bf1_header.html', 'Battlefield 1', BF1LoadPageFromQueryString, BF1_VERSION_STRING)
}

/*
  Load the BF1 main/entry/index page
*/
function openBF1IndexPage () {
  $('.bf1-main-content').load('./pages/bf1/bf1_index.html', BF1initializeIndexPage)
}

/*
  Load the BF1 General Info page
*/
function openBF1GeneralInfoPage () {
  $('.bf1-main-content').load('./pages/bf1/bf1_generalinfo.html')
}


/*
  Display BF1 page to user. This should be
  done after data has been succesfully loaded
*/
function openBF1ComparisonPage () {
  if (BF1DataLoaded === false) {
    BF1SelectedPage = "BF1_COMPARISON"
    BF1LoadWeaponData()
  } else {
    loadBF1ComparisonPage()
  }
}

function loadBF1ComparisonPage(){
  $('.bf1-main-content').load('./pages/bf1/bf1_comparison.html', initializeBF1Comparison)
}

/*
  Load the BF1 chart page
*/
function openBF1ChartPage () {
  if (BF1DataLoaded === false) {
    BF1SelectedPage = "BF1_CHART"
    BF1LoadWeaponData()
  } else {
    loadBF1ChartPage()
  }
}

function loadBF1ChartPage(){
    $('.bf1-main-content').load('./pages/bf1/bf1_chart.html', BF1initializeChartPage)
}


/*
  Main hub for opening different BF1 pages based on their name.
  Handles coloring of the buttons etc
*/
function BF1OpenPageByName(pageName) {
  // Remove highlighting
  $('.sym-pageSelections > div').removeClass('selected-selector')
  // Select right page according to pageName, highlight its
  // button and open the page
  if (pageName === 'Weapon Comparison') {
    $('#bf1-comparisonPageSelector').addClass('selected-selector')
    openBF1ComparisonPage()
    updateQueryString("bf1", "comparison")
  } else if (pageName === 'General Information') {
    $('#bf1-generalinfoPageSelector').addClass('selected-selector')
    openBF1GeneralInfoPage()
    updateQueryString("bf1", "general-info")
  } else if (pageName === 'Index') {
    $('#bf1-mainPageSelector').addClass('selected-selector')
    openBF1IndexPage()
    updateQueryString("bf1", "index")
	} else if (pageName === 'Weapon Charts') {
    $('#bf1-chartPageSelector').addClass('selected-selector')
    openBF1ChartPage()
    updateQueryString("bf1", "charts")
  }
}

/*
  Add handlers for the click events for the bf1 selector page and open
  the entry page for BF1
*/
function initializeBF1Selection () {
  BF1SetupPageHeader()
  openBF1IndexPage()
}

/*
  Add handlers for the click events for the bf1 index page
*/
function BF1initializeIndexPage(){
  $('.indexPageItem').click(function () {
      var itemClicked = $(this).find("h4").text()
      BF1OpenPageByName(itemClicked)
  })
}

function BF1SetupPageHeader(){
  loadBF1Stylesheet()
  $('.sym-pageSelections > div').click(function () {
    var clicked = $(this).attr('id')
    var pageName
    if (clicked === 'bf1-comparisonPageSelector') {
      pageName = 'Weapon Comparison'
    } else if (clicked === 'bf1-mainPageSelector') {
      pageName = 'Index'
	  } else if (clicked === 'bf1-generalinfoPageSelector') {
      pageName = 'General Information'
    } else if (clicked === 'bf1-chartPageSelector') {
      pageName = 'Weapon Charts'
    }
    BF1OpenPageByName(pageName)
  })
}

function BF1LoadPageFromQueryString(){
  BF1SetupPageHeader()
  BF1OpenPageByName(bf1PageToLoad)
}
