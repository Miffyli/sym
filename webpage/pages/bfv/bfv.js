// Path to datafile
const BFV_DATA = './pages/bfv/data/bfv_F.json'

// Constants for BFV
// Constants for plotting damage/ttk/etc
const BFV_DAMAGE_RANGE_START = 0
const BFV_DAMAGE_RANGE_END = 120
const BFV_DAMAGE_RANGE_STEP = 1

// Minimum damage multiplier (9.1.2018)
const BFV_MIN_DAMAGE_MULTIPLIER = 1.0

// A flag to tell if we have loaded BFV data already
var BFVDataLoaded = false
// This will be the main holder of all the weapon data.
// An array of dictionaries, each of which is a weapon
var BFVWeaponData = []
// This will be similar to data, except
// keys are the full weapon names (with attachments)
// and values are the weapons
var BFVWeaponNameToData = {}
// This will be all the keys available per weapon
// (i.e. variable names)
var BFVWeaponKeys = []
// Variable name -> array, where indexing is same as in
// BFVWeaponData
var BFVWeaponKeyToData = {}
// Keeps track of which page to load after the data is loaded.
var BFVSelectedPage = ""

/*
  Returns html RGB color code for given array
  Nicked from Stackoverflow #41310869
*/
function BFVArrayToRGB(values) {
  return 'rgb(' + values.join(', ') + ')';
}

/*
  Interpolate color between two arrays.
  `ratio` specifies how much "rgb2" is in the color
*/
function BFVInterpolateRGB(rgb1, rgb2, ratio) {
  return rgb1.map((rgb1Val, i) => rgb1Val + (rgb2[i] - rgb1Val) * ratio)
}

/*
  Return weapon's damage at given point dist.
  damages and distances specify how much weapon
  does damage at those points, and everything
  else is linearly interpolated between.
*/
function BFVInterpolateDamage (dist, damages, distances) {
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
function BFVGetDamageOverDistance (weapon) {
  var damages = weapon['Damages']
  var distances = weapon['Dmg_distances']
  var damageOverDistance = []

  // Loop over distance and store damages
  for (var dist = BFV_DAMAGE_RANGE_START; dist <= BFV_DAMAGE_RANGE_END; dist += BFV_DAMAGE_RANGE_STEP) {
    damageOverDistance.push([dist, BFVInterpolateDamage(dist, damages, distances)])
  }
  return damageOverDistance
}

/*
  Return array of [distance, bullets],
  where length of the array is based on constants
  defined above
*/
function BFVGetBTKUpperBoundOverDistance (weapon) {
  var damages = weapon['Damages']
  var distances = weapon['Dmg_distances']
  var BTKUBOverDistance = []

  // Loop over distance and store damages
  var damageAtDist = 0
  for (var dist = BFV_DAMAGE_RANGE_START; dist <= BFV_DAMAGE_RANGE_END; dist += BFV_DAMAGE_RANGE_STEP) {
    damageAtDist = BFVInterpolateDamage(dist, damages, distances)
    BTKUBOverDistance.push([dist, Math.ceil(100 / (damageAtDist * BFV_MIN_DAMAGE_MULTIPLIER))])
  }
  return BTKUBOverDistance
}

/*
  Return array of [distance, milliseconds],
  where length of the array is based on constants
  defined above
*/
function BFVGetTTKUpperBoundOverDistance (weapon) {
  var damages = weapon['Damages']
  var distances = weapon['Dmg_distances']
  var bulletVelocity = weapon['InitialSpeed']
  var bulletDrag = weapon['Drag']
  var msPerShot = 60000 / (weapon['RoF'])
  var TTKUBOverDistance = []

  // Loop over distance and store damages
  var damageAtDist = 0
  var msToTarget = 0
  var bulletsToKill = 0
  // Used to track how long bullet has been flying
  var bulletFlightSeconds = 0.0
  for (var dist = BFV_DAMAGE_RANGE_START; dist <= BFV_DAMAGE_RANGE_END; dist += BFV_DAMAGE_RANGE_STEP) {
    damageAtDist = BFVInterpolateDamage(dist, damages, distances)
    // Floor because we do not need the last bullet
    bulletsToKill = Math.floor(100 / (damageAtDist * BFV_MIN_DAMAGE_MULTIPLIER))

    msToTarget = bulletFlightSeconds * 1000
    // Update bullet velocity and time we are flying
    bulletFlightSeconds += BFV_DAMAGE_RANGE_STEP / bulletVelocity
    // Update according to drag
    bulletVelocity -= (Math.pow(bulletVelocity, 2) * bulletDrag) * (BFV_DAMAGE_RANGE_STEP / bulletVelocity)

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
function BFVLoadSuccessCallback (data) {
  BFVWeaponData = data
  // Create name_to_data objects
  for (var i = 0; i < BFVWeaponData.length; i++) {
    BFVWeaponNameToData[BFVWeaponData[i]['WeapShowName']] = BFVWeaponData[i]
  }
  // All weapons should have same keys.
  // Take keys from the first weapon and store them as keys
  BFVWeaponKeys = Object.keys(BFVWeaponData[0])
  // Sort keys for consistency between runs etc
  BFVWeaponKeys.sort()

  // Create BFVWeaponKeyToData
  var key
  for (var keyi = 0; keyi < BFVWeaponKeys.length; keyi++) {
    key = BFVWeaponKeys[keyi]
    var dataRow = []
    for (var weapi = 0; weapi < BFVWeaponData.length; weapi++) {
      dataRow.push(BFVWeaponData[weapi][key])
    }
    BFVWeaponKeyToData[key] = dataRow
  }
  BFVDataLoaded = true

  // Proceed to appropriate page
  if (BFVSelectedPage === "BFV_CHART"){
    loadBFVChartPage()
  } else if (BFVSelectedPage === "BFV_COMPARISON"){
    loadBFVComparisonPage()
  }
}

/*
  Load BFV data from the JSON file, and parse it
  into the global variables
*/
function BFVLoadWeaponData () {
  // TODO Add some kind of progress bar here?
  $.getJSON(BFV_DATA).done(BFVLoadSuccessCallback).fail(function (jqxhr, textStatus, error) {
    console.log('Loading BFV data failed: ' + textStatus + ' , ' + error)
  })
}

/*
  Load the BFV selector page that contains the buttons to allow
  the user to select which page to navigate to (chart, comp, etc...).
*/
function openBFVSelectionPage () {
  loadPageWithHeader('./pages/bfv/bfv_header.html', 'Battlefield V', initializeBFVSelectrion)
}

/*
  Load the BFV main/entry/index page
*/
function openBFVIndexPage () {
  $('.bfv-main-content').load('./pages/bfv/bfv_index.html', initializeIndexPage)
}

/*
  Load the BFV General Info page
*/
function openBFVGeneralInfoPage () {
  $('.bfv-main-content').load('./pages/bfv/bfv_generalinfo.html')
}

/*
  Load the BFV weapon data page
*/
function openBFVWeaponPage () {
  $('.bfv-main-content').load('./pages/bfv/bfv_dataWeapon.html', function(){MathJax.typeset()})
}

/*
  Load the BFV chart page
*/
function openBFVChartPage () {
  if (BFVDataLoaded === false) {
    BFVSelectedPage = "BFV_CHART"
    BFVLoadWeaponData()
  } else {
    loadBFVChartPage()
  }
}

function loadBFVChartPage(){
    $('.bfv-main-content').load('./pages/bfv/bfv_chart.html', initializeChartPage)
}

/*
  Display BFV page to user. This should be
  done after data has been succesfully loaded
*/
function openBFVComparisonPage () {
  if (BFVDataLoaded === false) {
    BFVSelectedPage = "BFV_COMPARISON"
    BFVLoadWeaponData()
  } else {
    loadBFVComparisonPage()
  }
}

function loadBFVComparisonPage(){
  $('.bfv-main-content').load('./pages/bfv/bfv_comparison.html', initializeBFVComparison)
}
/*
  Load the BFV equipment data page
*/
function openBFVEquipmentPage () {
  $('.bfv-main-content').load('./pages/bfv/bfv_dataEquipment.html')
}

/*
  Load the BFV vehicle data page
*/
function openBFVVehiclePage () {
  $('.bfv-main-content').load('./pages/bfv/bfv_dataVehicle.html')
}

/*
  Main hub for opening different BFV pages based on their name.
  Handles coloring of the buttons etc
*/
function BFVOpenPageByName(pageName) {
  // Remove highlighting
  $('.sym-pageSelections > div').removeClass('selected-selector')
  // Select right page according to pageName, highlight its
  // button and open the page
  if (pageName === 'Weapon Charts') {
    $('#bfv-chartPageSelector').addClass('selected-selector')
    openBFVChartPage()
  } else if (pageName === 'Weapon Comparison') {
    $('#bfv-comparisonPageSelector').addClass('selected-selector')
    openBFVComparisonPage()
  } else if (pageName === 'General Information') {
    $('#bfv-generalinfoPageSelector').addClass('selected-selector')
    openBFVGeneralInfoPage()
  } else if (pageName === 'Equipment Data') {
    $('#bfv-equipmentPageSelector').addClass('selected-selector')
    openBFVEquipmentPage()
  } else if (pageName === 'Vehicle Data') {
    $('#bfv-vehiclePageSelector').addClass('selected-selector')
    openBFVVehiclePage()
  } else if (pageName === 'Index') {
    $('#bfv-mainPageSelector').addClass('selected-selector')
    openBFVIndexPage()
	} else if (pageName === 'Weapon Mechanics') {
    $('#bfv-weaponPageSelector').addClass('selected-selector')
    openBFVWeaponPage()
  }
}

/*
  Add handlers for the click events for the bfv selector page and open
  the entry page for BFV
*/
function initializeBFVSelectrion () {
  $('.sym-pageSelections > div').click(function () {
    var clicked = $(this).attr('id')
    var pageName
    if (clicked === 'bfv-chartPageSelector') {
      pageName = 'Weapon Charts'
    } else if (clicked === 'bfv-comparisonPageSelector') {
      pageName = 'Weapon Comparison'
    } else if (clicked === 'bfv-mainPageSelector') {
      pageName = 'Index'
	  } else if (clicked === 'bfv-generalinfoPageSelector') {
      pageName = 'General Information'
	  } else if (clicked === 'bfv-equipmentPageSelector') {
      pageName = 'Equipment Data'
	  } else if (clicked === 'bfv-weaponPageSelector') {
      pageName = 'Weapon Mechanics'
    } else if (clicked === 'bfv-vehiclePageSelector') {
      pageName = 'Vehicle Data'
    }
    BFVOpenPageByName(pageName)
  })
  openBFVIndexPage()
}

/*
  Add handlers for the click events for the bfv index page
*/
function initializeIndexPage(){
  $('.indexPageItem').click(function () {
      var itemClicked = $(this).find("h4").text()
      // TODO slippery slope: If title on the buttons changes,
      //                      it will break opening the page
      BFVOpenPageByName(itemClicked)
  })
}
