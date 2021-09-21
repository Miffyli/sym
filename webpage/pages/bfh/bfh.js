// Path to datafile
const BFH_DATA = './pages/bfh/data/bfh.json'

// Manual dates when the data or pages have been modified.
// In format "[day] [month three letters] [year four digits]"
// e.g. 2nd Jan 2019
const BFH_DATA_DATE = 'BFH_6'
const BFH_PAGE_DATE = '22nd April 2020'

// Total version string displayed under title
const BFH_VERSION_STRING = `Latest updates<br>Page: ${BFH_PAGE_DATE}<br>Data: ${BFH_DATA_DATE}`

// Constants for BFH
// Constants for plotting damage/ttk/etc
const BFH_DAMAGE_RANGE_START = 0
const BFH_DAMAGE_RANGE_END = 120
const BFH_DAMAGE_RANGE_STEP = 1

// Minimum damage multiplier (9.1.2018)
const BFH_MIN_DAMAGE_MULTIPLIER = 1.0

// Set of variables that should be considered worse
// if the number is lower
const BFH_LOWER_IS_WORSE = new Set([
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
  'ADSStandBaseSpreadDec',
  'ADSProneRecoilDec',
  'ADSStandRecoilDec',
  'ADSCrouchRecoilDec',
  'ADSRecoilDec',
  'HeatClipSize',
  'FirstShotHIPSpreadMul',
  'FirstShotADSSpreadMul',
  'ShotsPerShell',
  'Pellets',
  'DOStart',
  'DOEnd'
])

// List of attachments allowed in the two separate losts
// (one attachment per slot)
const BFH_ALLOWED_ATTACHMENTS = [
  [
    'none',
    'barrel_suppressor',
    'barrel_heavy',
    'barrel_flashhider',
    'barrel_compensator',
    'barrel_muzzlebrake'
  ], [
    'none',
    'grip_firstshotrecoil',
    'grip_movingdispersion',
    'grip_sprintrecovery',
    'bipod',
    'bipod_lmg',
    'bipod_sniper'
  ], [
    'none',
    'accesory_targetpointer',
    'extended_magazines',
    'grip_sprintrecovery' // Stock
  ]
]

// Map previous attachment names to something prettier
// for human consumption
var BFH_ATTACHMENT_NAME_MAPPING = new Object();
BFH_ATTACHMENT_NAME_MAPPING.bipod = 'Bipod (Deployed)'
BFH_ATTACHMENT_NAME_MAPPING.bipod_lmg = 'Bipod LMG (Deployed)'
BFH_ATTACHMENT_NAME_MAPPING.bipod_sniper = 'Bipod Sniper (Deployed)'
BFH_ATTACHMENT_NAME_MAPPING.barrel_compensator = 'Compensator'
BFH_ATTACHMENT_NAME_MAPPING.barrel_heavy = 'Heavy barrel'
BFH_ATTACHMENT_NAME_MAPPING.barrel_flashhider = 'Flash hider'
BFH_ATTACHMENT_NAME_MAPPING.barrel_muzzlebrake = 'Muzzle brake'
BFH_ATTACHMENT_NAME_MAPPING.barrel_suppressor = 'Suppressor (Any)'
BFH_ATTACHMENT_NAME_MAPPING.grip_firstshotrecoil = 'Angled/Folding grip'
BFH_ATTACHMENT_NAME_MAPPING.grip_movingdispersion = 'Ergo/Vertical grip'
BFH_ATTACHMENT_NAME_MAPPING.grip_sprintrecovery = 'Potato/Stubby grip, Stock'
BFH_ATTACHMENT_NAME_MAPPING.accesory_targetpointer = 'Laser (Any, active)'
BFH_ATTACHMENT_NAME_MAPPING.extended_magazines = 'Extended Magazines'
BFH_ATTACHMENT_NAME_MAPPING.none = 'None'

// A flag to tell if we have loaded BFH data already
var BFHDataLoaded = false
// This will be the main holder of all the weapon data.
// An array of dictionaries, each of which is a weapon
var BFHWeaponData = []
// This will be similar to data, except
// keys are the full weapon names (with attachments)
// and values are the weapons
var BFHWeaponNameToData = {}
// This will be all the keys available per weapon
// (i.e. variable names)
var BFHWeaponKeys = []
// Variable name -> array, where indexing is same as in
// BFHWeaponData
var BFHWeaponKeyToData = {}
// Keeps track of which page to load after the data is loaded.
var BFHSelectedPage = ""
// Keeps track of which page to load when loading from a querystring
var bfhPageToLoad = ""

/*
  Returns html RGB color code for given array
  Nicked from Stackoverflow #41310869
*/
function BFHArrayToRGB(values) {
  return 'rgb(' + values.join(', ') + ')';
}

/*
  Interpolate color between two arrays.
  `ratio` specifies how much "rgb2" is in the color
*/
function BFHInterpolateRGB(rgb1, rgb2, ratio) {
  return rgb1.map((rgb1Val, i) => rgb1Val + (rgb2[i] - rgb1Val) * ratio)
}

/*
  Return weapon's damage at given point dist.
  damages and distances specify how much weapon
  does damage at those points, and everything
  else is linearly interpolated between.
*/
function BFHInterpolateDamage (dist, damages, distances) {
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
function BFHGetDamageOverDistance (weapon) {
  var damages = [weapon['SDmg'], weapon['EDmg']]
  var distances = [weapon['DOStart'], weapon['DOEnd']]
  var damageOverDistance = []

  // Loop over distance and store damages
  for (var dist = BFH_DAMAGE_RANGE_START; dist <= BFH_DAMAGE_RANGE_END; dist += BFH_DAMAGE_RANGE_STEP) {
    damageOverDistance.push([dist, BFHInterpolateDamage(dist, damages, distances)])
  }
  return damageOverDistance
}

/*
  Return array of [distance, bullets],
  where length of the array is based on constants
  defined above
*/
function BFHGetBTKUpperBoundOverDistance (weapon) {
  var damages = [weapon['SDmg'], weapon['EDmg']]
  var distances = [weapon['DOStart'], weapon['DOEnd']]
  var BTKUBOverDistance = []

  // Loop over distance and store damages
  var damageAtDist = 0
  for (var dist = BFH_DAMAGE_RANGE_START; dist <= BFH_DAMAGE_RANGE_END; dist += BFH_DAMAGE_RANGE_STEP) {
    damageAtDist = BFHInterpolateDamage(dist, damages, distances)
    BTKUBOverDistance.push([dist, Math.ceil(100 / (damageAtDist * BFH_MIN_DAMAGE_MULTIPLIER))])
  }
  return BTKUBOverDistance
}

/*
  Return array of [distance, milliseconds],
  where length of the array is based on constants
  defined above
*/
function BFHGetTTKUpperBoundOverDistance (weapon) {
  var damages = [weapon['SDmg'], weapon['EDmg']]
  var distances = [weapon['DOStart'], weapon['DOEnd']]
  var bulletVelocity = weapon['InitialSpeed']
  var numShots = weapon['Pellets'] || 1
  var msPerShot = 60000 / (weapon['RoF'])
  var TTKUBOverDistance = []

  // Loop over distance and store damages
  var damageAtDist = 0
  var msToTarget = 0
  var bulletsToKill = 0
  // Used to track how long bullet has been flying
  var bulletFlightSeconds = 0.0
  for (var dist = BFH_DAMAGE_RANGE_START; dist <= BFH_DAMAGE_RANGE_END; dist += BFH_DAMAGE_RANGE_STEP) {
    damageAtDist = BFHInterpolateDamage(dist, damages, distances) * numShots
    // Floor because we do not need the last bullet
    // Small epsilon is added to fix situation with 100 damage (100 / 100 = 1)
    bulletsToKill = Math.floor(100 / (damageAtDist * BFH_MIN_DAMAGE_MULTIPLIER + 0.00001))

    msToTarget = bulletFlightSeconds * 1000
    // Update bullet velocity and time we are flying
    bulletFlightSeconds += BFH_DAMAGE_RANGE_STEP / bulletVelocity

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
function BFHLoadSuccessCallback (data) {
  loadBFHStylesheet()
  BFHWeaponData = data
  // Create name_to_data objects
  for (var i = 0; i < BFHWeaponData.length; i++) {
    BFHWeaponNameToData[BFHWeaponData[i]['WeapShowName']] = BFHWeaponData[i]
  }
  // All weapons should have same keys.
  // Take keys from the first weapon and store them as keys
  BFHWeaponKeys = Object.keys(BFHWeaponData[0])
  // Sort keys for consistency between runs etc
  BFHWeaponKeys.sort()

  // Create BFHWeaponKeyToData
  var key
  for (var keyi = 0; keyi < BFHWeaponKeys.length; keyi++) {
    key = BFHWeaponKeys[keyi]
    var dataRow = []
    for (var weapi = 0; weapi < BFHWeaponData.length; weapi++) {
      dataRow.push(BFHWeaponData[weapi][key])
    }
    BFHWeaponKeyToData[key] = dataRow
  }
  BFHDataLoaded = true

  // Proceed to appropriate page
  if (BFHSelectedPage === "BFH_CHART"){
    loadBFHChartPage()
  } else if (BFHSelectedPage === "BFH_COMPARISON"){
    loadBFHComparisonPage()
  }
}

/*
  Load BFH data from the JSON file, and parse it
  into the global variables
*/
function BFHLoadWeaponData () {
  // TODO Add some kind of progress bar here?
  $.getJSON(BFH_DATA).done(BFHLoadSuccessCallback).fail(function (jqxhr, textStatus, error) {
    console.log('Loading BFH data failed: ' + textStatus + ' , ' + error)
  })
}

/*
  Display BFH page to user. This should be
  done after data has been succesfully loaded
*/
function openBFHComparisonPage () {

  if (BFHDataLoaded === false) {
    BFHSelectedPage = "BFH_COMPARISON"
    BFHLoadWeaponData()
  } else {
    loadBFHComparisonPage()
  }
}

function loadBFHComparisonPage(){
  $('.otherTitles-main-content').load('./pages/bfh/bfh_comparison.html', initializeBFHComparison)
}

/*
  Load the BFH chart page
*/
function openBFHChartPage () {
  if (BFHDataLoaded === false) {
    BFHSelectedPage = "BFH_CHART"
    BFHLoadWeaponData()
  } else {
    loadBFHChartPage()
    loadBFHStylesheet()
  }
}

function loadBFHChartPage(){
  $('.otherTitles-main-content').load('./pages/bfh/bfh_chart.html', BFHinitializeChartPage)
}
