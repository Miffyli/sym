// Path to datafile
const BF2042_DATA = './pages/bf2042/data/bf2042.json'

// Manual dates when the data or pages have been modified.
// In format "[day] [month three letters] [year four digits]"
// e.g. 2nd Jan 2019
const BF2042_DATA_DATE = '19th December 2021'
const BF2042_PAGE_DATE = '19th December 2021'

// Total version string displayed under title
const BF2042_VERSION_STRING = `Latest updates<br>Page: ${BF2042_PAGE_DATE}<br>Data: ${BF2042_DATA_DATE}`

// Constants for BF2042
// Constants for plotting damage/ttk/etc
const BF2042_DAMAGE_RANGE_START = 0
const BF2042_DAMAGE_RANGE_END = 120
const BF2042_DAMAGE_RANGE_STEP = 1

// Minimum damage multiplier (9.1.2018)
const BF2042_MIN_DAMAGE_MULTIPLIER = 1.0

// Set of variables that should be considered worse
// if the number is lower
const BF2042_LOWER_IS_WORSE = new Set([
  'SDmg',
  'EDmg',
  'RoF',
  'SingleRoF',
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
  'ShotsPerShell',
  'Pellets',
  "MaxDmg",
  "BurstRoF",
  "MinDmg",
  "MinDmgStarts",
  "MaxDmgEnds",
  "InitialSpeedZ",
  "ShotsPerBurst",
  "ReloadSpeed",
  'ADSStandBaseSpreadDecCoef',
  'HIPStandBaseSpreadDecCoef',
  'ADSCrouchBaseSpreadDecCoef',
  'HIPCrouchBaseSpreadDecCoef',
  'ADSProneBaseSpreadDecCoef',
  'HIPProneBaseSpreadDecCoef',
  'ADSStandMoveSpreadDecCoef',
  'HIPStandMoveSpreadDecCoef',
  'ADSCrouchMoveSpreadDecCoef',
  'HIPCrouchMoveSpreadDecCoef',
  'ADSProneMoveSpreadDecCoef',
  'HIPProneMoveSpreadDecCoef',
  'ADSStandBaseSpreadDecCoef',
  'ADSStandBaseSpreadDecOffset',
  'HIPStandBaseSpreadDecOffset',
  'ADSCrouchBaseSpreadDecOffset',
  'HIPCrouchBaseSpreadDecOffset',
  'ADSProneBaseSpreadDecOffset',
  'HIPProneBaseSpreadDecOffset',
  'ADSStandMoveSpreadDecOffset',
  'HIPStandMoveSpreadDecOffset',
  'ADSCrouchMoveSpreadDecOffset',
  'HIPCrouchMoveSpreadDecOffset',
  'ADSProneMoveSpreadDecOffset',
  'HIPProneMoveSpreadDecOffset',
  'ADSStandBaseSpreadDecOffset',
  'ADSStandBaseSpreadDecExp',
  'HIPStandBaseSpreadDecExp',
  'ADSCrouchBaseSpreadDecExp',
  'HIPCrouchBaseSpreadDecExp',
  'ADSProneBaseSpreadDecExp',
  'HIPProneBaseSpreadDecExp',
  'ADSStandMoveSpreadDecExp',
  'HIPStandMoveSpreadDecExp',
  'ADSCrouchMoveSpreadDecExp',
  'HIPCrouchMoveSpreadDecExp',
  'ADSProneMoveSpreadDecExp',
  'HIPProneMoveSpreadDecExp',
  'ADSStandBaseSpreadDecExp',
  'ADSProneRecoilDecExponent',
  'ADSStandRecoilDecExponent',
  'ADSCrouchRecoilDecExponent',
  'ADSProneRecoilDecFactor',
  'ADSStandRecoilDecFactor',
  'ADSCrouchRecoilDecFactor',
  'ADSStandBaseSpreadIdleOffset',
  'HIPStandBaseSpreadIdleOffset',
  'ADSCrouchBaseSpreadIdleOffset',
  'HIPCrouchBaseSpreadIdleOffset',
  'ADSProneBaseSpreadIdleOffset',
  'HIPProneBaseSpreadIdleOffset',
  'ADSStandMoveSpreadIdleOffset',
  'HIPStandMoveSpreadIdleOffset',
  'ADSCrouchMoveSpreadIdleOffset',
  'HIPCrouchMoveSpreadIdleOffset',
  'ADSProneMoveSpreadIdleOffset',
  'HIPProneMoveSpreadIdleOffset',
  'ADSStandBaseSpreadIdleOffset'
])

const BF2042_FORCE_COMPARISON_VALUES = new Set([
  'HIPVerticalRecoilMultipliers',
  'ADSVerticalRecoilMultipliers',
  'HIPHorizontalRecoilMultipliers',
  'ADSHorizontalRecoilMultipliers'
])

// A flag to tell if we have loaded BF2042 data already
var BF2042DataLoaded = false
// This will be the main holder of all the weapon data.
// An array of dictionaries, each of which is a weapon
var BF2042WeaponData = []
// This will be similar to data, except
// keys are the full weapon names (with attachments)
// and values are the weapons
var BF2042WeaponNameToData = {}
// This will be all the keys available per weapon
// (i.e. variable names)
var BF2042WeaponKeys = []
// Variable name -> array, where indexing is same as in
// BF2042WeaponData
var BF2042WeaponKeyToData = {}
// Keeps track of which page to load after the data is loaded.
var BF2042SelectedPage = ""
// Keeps track of which page to load when loading from a querystring
var bf2042PageToLoad = ""

/*
  Returns html RGB color code for given array
  Nicked from Stackoverflow #41310869
*/
function BF2042ArrayToRGB(values) {
  return 'rgb(' + values.join(', ') + ')';
}

/*
  Interpolate color between two arrays.
  `ratio` specifies how much "rgb2" is in the color
*/
function BF2042InterpolateRGB(rgb1, rgb2, ratio) {
  return rgb1.map((rgb1Val, i) => rgb1Val + (rgb2[i] - rgb1Val) * ratio)
}

/*
  Return weapon's damage at given point dist.
  damages and distances specify how much weapon
  does damage at those points, and everything
  else is linearly interpolated between.
*/
function BF2042InterpolateDamage (dist, damages, distances) {
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
    // NOTE: BF2042 uses "step" interpolation for all non-portal weapons, so we hardcode it here.
    //       However, data will tell the interpolation type so we can implement it later 
    var interpolated = prevDmg
    // Older linear interpolation
    //var interpolated = prevDmg + ((dist - prevDist) / (nextDist - prevDist)) * (nextDmg - prevDmg)
    return interpolated
  }
}

/*
  Return array of [distance, damage],
  where length of the array is based on constants
  defined above
*/
function BF2042GetDamageOverDistance (weapon) {
  var damages = weapon['Damages']
  var distances = weapon['Dmg_distances']
  var damageOverDistance = []

  // Loop over distance and store damages
  for (var dist = BF2042_DAMAGE_RANGE_START; dist <= BF2042_DAMAGE_RANGE_END; dist += BF2042_DAMAGE_RANGE_STEP) {
    damageOverDistance.push([dist, BF2042InterpolateDamage(dist, damages, distances)])
  }
  return damageOverDistance
}

/*
  Return array of [distance, bullets],
  where length of the array is based on constants
  defined above
*/
function BF2042GetBTKUpperBoundOverDistance (weapon) {
  var damages = weapon['Damages']
  var distances = weapon['Dmg_distances']
  var BTKUBOverDistance = []

  // Loop over distance and store damages
  var damageAtDist = 0
  for (var dist = BF2042_DAMAGE_RANGE_START; dist <= BF2042_DAMAGE_RANGE_END; dist += BF2042_DAMAGE_RANGE_STEP) {
    damageAtDist = BF2042InterpolateDamage(dist, damages, distances)
    BTKUBOverDistance.push([dist, Math.ceil(100 / (damageAtDist * BF2042_MIN_DAMAGE_MULTIPLIER))])
  }
  return BTKUBOverDistance
}

/*
  Return array of [distance, milliseconds],
  where length of the array is based on constants
  defined above
*/
function BF2042GetTTKUpperBoundOverDistance (weapon) {
  var damages = weapon['Damages']
  var distances = weapon['Dmg_distances']
  var numShots = weapon['ShotsPerShell']
  var msPerShot = 60000 / (weapon['RoF'])
  var TTKUBOverDistance = []

  // Loop over distance and store damages
  var damageAtDist = 0
  var bulletsToKill = 0
  for (var dist = BF2042_DAMAGE_RANGE_START; dist <= BF2042_DAMAGE_RANGE_END; dist += BF2042_DAMAGE_RANGE_STEP) {
    // Assumption: All shots hit from a weapon with multiple shots
    damageAtDist = BF2042InterpolateDamage(dist, damages, distances) * numShots
    // Floor because we do not need the last bullet
    // Small epsilon is added to fix situation with 100 damage (100 / 100 = 1)
    bulletsToKill = Math.floor(100 / (damageAtDist * BF2042_MIN_DAMAGE_MULTIPLIER + 0.00001))

    // The only time from bullet flight comes from the last bullet that lands on the enemy,
    // hence we only add msToTarget once
    TTKUBOverDistance.push([dist, bulletsToKill * msPerShot])
  }
  return TTKUBOverDistance
}

/*
  Function to handle JSON data upon receiving it:
  Parse JSON data and preprocess it into different
  arrays.
*/
function BF2042LoadSuccessCallback (data) {
  loadBF2042Stylesheet()

  BF2042WeaponData = data
  // Create name_to_data objects
  for (var i = 0; i < BF2042WeaponData.length; i++) {
    BF2042WeaponNameToData[BF2042WeaponData[i]['WeapShowName']] = BF2042WeaponData[i]
  }
  
  // All weapons should have same keys.
  // Take keys from the first weapon and store them as keys
  BF2042WeaponKeys = Object.keys(BF2042WeaponData[0])
  // Sort keys for consistency between runs etc
  BF2042WeaponKeys.sort()

  // Create BF2042WeaponKeyToData
  var key
  for (var keyi = 0; keyi < BF2042WeaponKeys.length; keyi++) {
    key = BF2042WeaponKeys[keyi]
    var dataRow = []
    for (var weapi = 0; weapi < BF2042WeaponData.length; weapi++) {
      dataRow.push(BF2042WeaponData[weapi][key])
    }
    BF2042WeaponKeyToData[key] = dataRow
  }
  BF2042DataLoaded = true

  // Proceed to appropriate page
  if (BF2042SelectedPage === "BF2042_CHART"){
    loadBF2042ChartPage()
  } else if (BF2042SelectedPage === "BF2042_COMPARISON"){
    loadBF2042ComparisonPage()
  }
}

/*
  Load BF2042 data from the JSON file, and parse it
  into the global variables
*/
function BF2042LoadWeaponData () {
  // TODO Add some kind of progress bar here?
  $.getJSON(BF2042_DATA).done(BF2042LoadSuccessCallback).fail(function (jqxhr, textStatus, error) {
    console.log('Loading BF2042 data failed: ' + textStatus + ' , ' + error)
  })
}

/*
  Display BF2042 page to user. This should be
  done after data has been successfully loaded
*/
function openBF2042ComparisonPage () {
  if (BF2042DataLoaded === false) {
    BF2042SelectedPage = "BF2042_COMPARISON"
    BF2042LoadWeaponData()
  } else {
    loadBF2042ComparisonPage()
  }
}

function loadBF2042ComparisonPage(){
  $('.otherTitles-main-content').load('./pages/bf2042/bf2042_comparison.html', initializeBF2042Comparison)
}

/*
  Load the BF2042 chart page
*/
function openBF2042ChartPage () {
  if (BF2042DataLoaded === false) {
    BF2042SelectedPage = "BF2042_CHART"
    BF2042LoadWeaponData()
  } else {
    loadBF2042ChartPage()
    loadBF2042Stylesheet()
  }
}

function loadBF2042ChartPage(){
  $('.otherTitles-main-content').load('./pages/bf2042/bf2042_chart.html', BF2042initializeChartPage)
}

function openBF2042GeneralInfoPage () {
  $('.otherTitles-main-content').load('./pages/bf2042/bf2042_generalinfo.html')
}
/*
  Load the BF2042 weapon data page
*/
function openBF2042WeaponInfoPage () {
  $('.otherTitles-main-content').load('./pages/bf2042/bf2042_dataWeapon.html', function(){MathJax.typeset()})
}