// Path to datafile
const BF3_DATA = './pages/bf3/data/bf3.json'
// Keeps track of which page to load after the data is loaded.
var BF3SelectedPage = ""
// A flag to tell if we have loaded BF3 data already
var BF3DataLoaded = false

// This will be all the keys available per weapon
// (i.e. variable names)
var BF3WeaponKeys = []

// Mapping from WeaponShowNames to Set of
// allowed attachments
var BF3WeaponToAllowedAttachments = {}

// Minimum damage multiplier
const BF3_MIN_DAMAGE_MULTIPLIER = 1.0

// Constants for BF3
// Constants for plotting damage/ttk/etc
const BF3_DAMAGE_RANGE_START = 0
const BF3_DAMAGE_RANGE_END = 120
const BF3_DAMAGE_RANGE_STEP = 1

// Set of variables that should be considered worse
// if the number is lower
const BF3_LOWER_IS_WORSE = new Set([
  'ADSRecoilDec',
  'BRoF',
  'BlastDamage',
  'BlastRadius',
  'Gravity',
  'InitialSpeed',
  'InnerBlastRadius',
  'MagSize',
  'Pellets',
  'RoF',
  'ShockwaveRadius',
  'SpreadDec',
  'DOEnd',
  'DOStart',
  'EDmg',
  'SDmg'
])

// List of attachments allowed in the two separate losts
// (one attachment per slot)
const BF3_ALLOWED_ATTACHMENTS = [
  [
    'none',
    'bipod',
    'foregrip',
  ], ['none',
    'flash_suppressor',
    'heavy_barrel',
    'laser',
    'silencer',
  ]
]

// Map previous attachment names to something prettier
// for human consumption
var BF3_ATTACHMENT_NAME_MAPPING = new Object();
BF3_ATTACHMENT_NAME_MAPPING.bipod = 'Bipod'
BF3_ATTACHMENT_NAME_MAPPING.foregrip = 'Foregrip'
BF3_ATTACHMENT_NAME_MAPPING.flash_suppressor = 'Flash Suppressor'
BF3_ATTACHMENT_NAME_MAPPING.heavy_barrel = 'Heavy Barrel'
BF3_ATTACHMENT_NAME_MAPPING.laser = 'Laser'
BF3_ATTACHMENT_NAME_MAPPING.silencer = 'Suppressor'
BF3_ATTACHMENT_NAME_MAPPING.none = 'None'

/*
  Returns html RGB color code for given array
  Nicked from Stackoverflow #41310869
*/
function BF3ArrayToRGB(values) {
  return 'rgb(' + values.join(', ') + ')';
}

/*
  Interpolate color between two arrays.
  `ratio` specifies how much "rgb2" is in the color
*/
function BF3InterpolateRGB(rgb1, rgb2, ratio) {
  return rgb1.map((rgb1Val, i) => rgb1Val + (rgb2[i] - rgb1Val) * ratio)
}

/*
  Return weapon's damage at given point dist.
  damages and distances specify how much weapon
  does damage at those points, and everything
  else is linearly interpolated between.
*/
function BF3InterpolateDamage (dist, damages, distances) {
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
function BF3GetDamageOverDistance (weapon) {
  var damages = [weapon['SDmg'], weapon['EDmg']]
  var distances = [weapon['DOStart'], weapon['DOEnd']]
  var damageOverDistance = []

  // Loop over distance and store damages
  for (var dist = BF3_DAMAGE_RANGE_START; dist <= BF3_DAMAGE_RANGE_END; dist += BF3_DAMAGE_RANGE_STEP) {
    damageOverDistance.push([dist, BF3InterpolateDamage(dist, damages, distances)])
  }
  return damageOverDistance
}

/*
  Return array of [distance, bullets],
  where length of the array is based on constants
  defined above
*/
function BF3GetBTKUpperBoundOverDistance (weapon) {
  var damages = [weapon['SDmg'], weapon['EDmg']]
  var distances = [weapon['DOStart'], weapon['DOEnd']]
  var BTKUBOverDistance = []

  // Loop over distance and store damages
  var damageAtDist = 0
  for (var dist = BF3_DAMAGE_RANGE_START; dist <= BF3_DAMAGE_RANGE_END; dist += BF3_DAMAGE_RANGE_STEP) {
    damageAtDist = BF3InterpolateDamage(dist, damages, distances)
    BTKUBOverDistance.push([dist, Math.ceil(100 / (damageAtDist * BF3_MIN_DAMAGE_MULTIPLIER))])
  }
  return BTKUBOverDistance
}

/*
  Return array of [distance, milliseconds],
  where length of the array is based on constants
  defined above
*/
function BF3GetTTKUpperBoundOverDistance (weapon) {
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
  for (var dist = BF3_DAMAGE_RANGE_START; dist <= BF3_DAMAGE_RANGE_END; dist += BF3_DAMAGE_RANGE_STEP) {
    damageAtDist = BF3InterpolateDamage(dist, damages, distances) * numShots
    // Floor because we do not need the last bullet
    // Small epsilon is added to fix situation with 100 damage (100 / 100 = 1)
    bulletsToKill = Math.floor(100 / (damageAtDist * BF3_MIN_DAMAGE_MULTIPLIER + 0.00001))

    msToTarget = bulletFlightSeconds * 1000
    // Update bullet velocity and time we are flying
    bulletFlightSeconds += BF3_DAMAGE_RANGE_STEP / bulletVelocity

    // Removed bullet velocity from equation, add back with "+ msToTarget"
    TTKUBOverDistance.push([dist, bulletsToKill * msPerShot])
  }
  return TTKUBOverDistance
}

/*
  Function to handle JSON data upon receiving it:
  Parse JSON data and preprocess it into different
  arrays.
*/
function BF3LoadSuccessCallback (data) {
  BF3WeaponData = data
  BF3DataLoaded = true

  loadBF3Stylesheet()

  // All weapons should have same keys.
  // Go over all weapons, gather keys
  // and create a list that contains
  // all possible keys
  var allKeys = new Set([])
  for (var i = 0; i < BF3WeaponData.length; i++) {
    var weaponKeys = new Set(Object.keys(BF3WeaponData[i]))
    // A biiiit ineffecient, but we only run this once
    // Stolen from https://2ality.com/2015/01/es6-set-operations.html
    allKeys = new Set([...allKeys, ...weaponKeys])
  }
  BF3WeaponKeys = Array.from(allKeys)
  // Sort keys for consistency between runs etc
  BF3WeaponKeys.sort()

  // Proceed to appropriate page
  if (BF3SelectedPage === "BF3_CHART"){
    loadBF3ChartPage()
  } else if (BF3SelectedPage === "BF3_COMPARISON"){
    loadBF3ComparisonPage()
  }
}

function openBF3ChartPage(){
  if (BF3DataLoaded === false) {
    BF3SelectedPage = "BF3_CHART"
    BF3LoadWeaponData()
  } else {
    loadBF3ChartPage()
    loadBF3Stylesheet()
  }
}

function openBF3ComparisonPage () {
  if (BF3DataLoaded === false) {
    BF3SelectedPage = "BF3_COMPARISON"
    BF3LoadWeaponData()
  } else {
    loadBF3ComparisonPage()
  }
}

function BF3LoadWeaponData () {
  $.getJSON(BF3_DATA).done(BF3LoadSuccessCallback).fail(function (jqxhr, textStatus, error) {
    console.log('Loading BF3 data failed: ' + textStatus + ' , ' + error)
  })
}

function loadBF3ChartPage(){
  $('.otherTitles-main-content').load('./pages/bf3/bf3_chart.html', BF3initializeChartPage)
}

function loadBF3ComparisonPage(){
  $('.otherTitles-main-content').load('./pages/bf3/bf3_comparison.html', initializeBF3Comparison)
}

function openBF3GeneralInfoPage () {
  $('.otherTitles-main-content').load('./pages/bf3/bf3_generalinfo.html')
}
/*
  Load the BF4 weapon data page
*/
function openBF3WeaponInfoPage () {
  $('.otherTitles-main-content').load('./pages/bf3/bf3_dataWeapon.html', function(){MathJax.typeset()})
}