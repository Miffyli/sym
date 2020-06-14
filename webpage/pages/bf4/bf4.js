// Path to datafile
const BF4_DATA = './pages/bf4/data/bf4.json'

// Manual dates when the data or pages have been modified.
// In format "[day] [month three letters] [year four digits]"
// e.g. 2nd Jan 2019
const BF4_DATA_DATE = 'BF4_B'
const BF4_PAGE_DATE = '19th April 2020'

// Total version string displayed under title
const BF4_VERSION_STRING = `Latest updates<br>Page: ${BF4_PAGE_DATE}<br>Data: ${BF4_DATA_DATE}`

// Constants for BF4
// Constants for plotting damage/ttk/etc
const BF4_DAMAGE_RANGE_START = 0
const BF4_DAMAGE_RANGE_END = 120
const BF4_DAMAGE_RANGE_STEP = 1

// Minimum damage multiplier (9.1.2018)
const BF4_MIN_DAMAGE_MULTIPLIER = 1.0

// Set of variables that should be considered worse
// if the number is lower
const BF4_LOWER_IS_WORSE = new Set([
  'SDmg',
  'EDmg',
  'RoF',
  'BRoF',
  'MagSize',
  'InitialSpeed',
  'InitialSpeed_Silencer',
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
  'ShotsPerShell'
])

// List of attachments allowed in the two separate losts
// (one attachment per slot)
const BF4_ALLOWED_ATTACHMENTS = [
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
    'accesory_targetpointer'
  ]
]

// Map previous attachment names to something prettier
// for human consumption
var BF4_ATTACHMENT_NAME_MAPPING = new Object();
BF4_ATTACHMENT_NAME_MAPPING.bipod = 'Bipod (Deployed)'
BF4_ATTACHMENT_NAME_MAPPING.bipod_lmg = 'Bipod LMG (Deployed)'
BF4_ATTACHMENT_NAME_MAPPING.bipod_sniper = 'Bipod Sniper (Deployed)'
BF4_ATTACHMENT_NAME_MAPPING.barrel_compensator = 'Compensator'
BF4_ATTACHMENT_NAME_MAPPING.barrel_heavy = 'Heavy barrel'
BF4_ATTACHMENT_NAME_MAPPING.barrel_flashhider = 'Flash hider'
BF4_ATTACHMENT_NAME_MAPPING.barrel_muzzlebrake = 'Muzzle brake'
BF4_ATTACHMENT_NAME_MAPPING.barrel_suppressor = 'Suppressor (Any)'
BF4_ATTACHMENT_NAME_MAPPING.grip_firstshotrecoil = 'Angled/Folding grip'
BF4_ATTACHMENT_NAME_MAPPING.grip_movingdispersion = 'Ergo/Vertical grip'
BF4_ATTACHMENT_NAME_MAPPING.grip_sprintrecovery = 'Potato/Stubby grip'
BF4_ATTACHMENT_NAME_MAPPING.accesory_targetpointer = 'Laser (Any, active)'
BF4_ATTACHMENT_NAME_MAPPING.none = 'None'

// A flag to tell if we have loaded BF4 data already
var BF4DataLoaded = false
// This will be the main holder of all the weapon data.
// An array of dictionaries, each of which is a weapon
var BF4WeaponData = []
// This will be similar to data, except
// keys are the full weapon names (with attachments)
// and values are the weapons
var BF4WeaponNameToData = {}
// This will be all the keys available per weapon
// (i.e. variable names)
var BF4WeaponKeys = []
// Variable name -> array, where indexing is same as in
// BF4WeaponData
var BF4WeaponKeyToData = {}
// Keeps track of which page to load after the data is loaded.
var BF4SelectedPage = ""
// Keeps track of which page to load when loading from a querystring
var bf4PageToLoad = ""

/*
  Returns html RGB color code for given array
  Nicked from Stackoverflow #41310869
*/
function BF4ArrayToRGB(values) {
  return 'rgb(' + values.join(', ') + ')';
}

/*
  Interpolate color between two arrays.
  `ratio` specifies how much "rgb2" is in the color
*/
function BF4InterpolateRGB(rgb1, rgb2, ratio) {
  return rgb1.map((rgb1Val, i) => rgb1Val + (rgb2[i] - rgb1Val) * ratio)
}

/*
  Return weapon's damage at given point dist.
  damages and distances specify how much weapon
  does damage at those points, and everything
  else is linearly interpolated between.
*/
function BF4InterpolateDamage (dist, damages, distances) {
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
function BF4GetDamageOverDistance (weapon) {
  var damages = [weapon['SDmg'], weapon['EDmg']]
  var distances = [weapon['DOStart'], weapon['DOEnd']]
  var damageOverDistance = []

  // Loop over distance and store damages
  for (var dist = BF4_DAMAGE_RANGE_START; dist <= BF4_DAMAGE_RANGE_END; dist += BF4_DAMAGE_RANGE_STEP) {
    damageOverDistance.push([dist, BF4InterpolateDamage(dist, damages, distances)])
  }
  return damageOverDistance
}

/*
  Return array of [distance, bullets],
  where length of the array is based on constants
  defined above
*/
function BF4GetBTKUpperBoundOverDistance (weapon) {
  var damages = [weapon['SDmg'], weapon['EDmg']]
  var distances = [weapon['DOStart'], weapon['DOEnd']]
  var BTKUBOverDistance = []

  // Loop over distance and store damages
  var damageAtDist = 0
  for (var dist = BF4_DAMAGE_RANGE_START; dist <= BF4_DAMAGE_RANGE_END; dist += BF4_DAMAGE_RANGE_STEP) {
    damageAtDist = BF4InterpolateDamage(dist, damages, distances)
    BTKUBOverDistance.push([dist, Math.ceil(100 / (damageAtDist * BF4_MIN_DAMAGE_MULTIPLIER))])
  }
  return BTKUBOverDistance
}

/*
  Return array of [distance, milliseconds],
  where length of the array is based on constants
  defined above
*/
function BF4GetTTKUpperBoundOverDistance (weapon) {
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
  for (var dist = BF4_DAMAGE_RANGE_START; dist <= BF4_DAMAGE_RANGE_END; dist += BF4_DAMAGE_RANGE_STEP) {
    // Assume all bullets hit the target
    damageAtDist = BF4InterpolateDamage(dist, damages, distances) * numShots
    // Floor because we do not need the last bullet
    // Small epsilon is added to fix situation with 100 damage (100 / 100 = 1)
    bulletsToKill = Math.floor(100 / (damageAtDist * BF4_MIN_DAMAGE_MULTIPLIER + 0.00001))

    msToTarget = bulletFlightSeconds * 1000
    // Update bullet velocity and time we are flying
    bulletFlightSeconds += BF4_DAMAGE_RANGE_STEP / bulletVelocity

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
function BF4LoadSuccessCallback (data) {
  loadBF4Stylesheet()

  BF4WeaponData = data
  // Create name_to_data objects
  for (var i = 0; i < BF4WeaponData.length; i++) {
    BF4WeaponNameToData[BF4WeaponData[i]['WeapShowName']] = BF4WeaponData[i]
  }
  // All weapons should have same keys.
  // Take keys from the first weapon and store them as keys
  BF4WeaponKeys = Object.keys(BF4WeaponData[0])
  // Sort keys for consistency between runs etc
  BF4WeaponKeys.sort()

  // Create BF4WeaponKeyToData
  var key
  for (var keyi = 0; keyi < BF4WeaponKeys.length; keyi++) {
    key = BF4WeaponKeys[keyi]
    var dataRow = []
    for (var weapi = 0; weapi < BF4WeaponData.length; weapi++) {
      dataRow.push(BF4WeaponData[weapi][key])
    }
    BF4WeaponKeyToData[key] = dataRow
  }
  BF4DataLoaded = true

  // Proceed to appropriate page
  if (BF4SelectedPage === "BF4_CHART"){
    loadBF4ChartPage()
  } else if (BF4SelectedPage === "BF4_COMPARISON"){
    loadBF4ComparisonPage()
  }
}

/*
  Load BF4 data from the JSON file, and parse it
  into the global variables
*/
function BF4LoadWeaponData () {
  // TODO Add some kind of progress bar here?
  $.getJSON(BF4_DATA).done(BF4LoadSuccessCallback).fail(function (jqxhr, textStatus, error) {
    console.log('Loading BF4 data failed: ' + textStatus + ' , ' + error)
  })
}

/*
  Display BF4 page to user. This should be
  done after data has been successfully loaded
*/
function openBF4ComparisonPage () {
  if (BF4DataLoaded === false) {
    BF4SelectedPage = "BF4_COMPARISON"
    BF4LoadWeaponData()
  } else {
    loadBF4ComparisonPage()
  }
}

function loadBF4ComparisonPage(){
  $('.otherTitles-main-content').load('./pages/bf4/bf4_comparison.html', initializeBF4Comparison)
}

/*
  Load the BF4 chart page
*/
function openBF4ChartPage () {
  if (BF4DataLoaded === false) {
    BF4SelectedPage = "BF4_CHART"
    BF4LoadWeaponData()
  } else {
    loadBF4ChartPage()
    loadBF4Stylesheet();
  }
}

function loadBF4ChartPage(){
  $('.otherTitles-main-content').load('./pages/bf4/bf4_chart.html', BF4initializeChartPage)
}

function openBF4GeneralInfoPage () {
  $('.otherTitles-main-content').load('./pages/bf4/bf4_generalinfo.html')
}
/*
  Load the BFV weapon data page
*/
function openBF4WeaponInfoPage () {
  $('.otherTitles-main-content').load('./pages/bf4/bf4_dataWeapon.html', function(){MathJax.typeset()})
}