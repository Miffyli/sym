// Path to datafile
const BF6_DATA = './pages/bf6/data/bf6.json'

// Manual dates when the data or pages have been modified.
// In format "[day] [month three letters] [year four digits]"
// e.g. 2nd Jan 2019
const BF6_DATA_DATE = '18 Nov 2025'
const BF6_PAGE_DATE = '03 Dec 2025'

// Total version string displayed under title
const BF6_VERSION_STRING = `Latest updates<br>Page: ${BF6_PAGE_DATE}<br>Data: ${BF6_DATA_DATE}`

// Constants for BF6
// Constants for plotting damage/ttk/etc
const BF6_DAMAGE_RANGE_START = 0
const BF6_DAMAGE_RANGE_END = 175
const BF6_DAMAGE_RANGE_STEP = 1

// Minimum damage multiplier (9.1.2018)
const BF6_MIN_DAMAGE_MULTIPLIER = 1.0

// Set of variables that should be considered worse
// if the number is lower
const BF6_LOWER_IS_WORSE = new Set([
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
  "BurstsPerMinute",
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

const BF6_FORCE_COMPARISON_VALUES = new Set([
  'HIPVerticalRecoilMultipliers',
  'ADSVerticalRecoilMultipliers',
  'HIPHorizontalRecoilMultipliers',
  'ADSHorizontalRecoilMultipliers'
])

// A flag to tell if we have loaded BF6 data already
var BF6DataLoaded = false
// This will be the main holder of all the weapon data.
// An array of dictionaries, each of which is a weapon
var BF6WeaponData = []
// This will be similar to data, except
// keys are the full weapon names (with attachments)
// and values are the weapons
var BF6WeaponNameToData = {}
// This will be all the keys available per weapon
// (i.e. variable names)
var BF6WeaponKeys = []
// Variable name -> array, where indexing is same as in
// BF6WeaponData
var BF6WeaponKeyToData = {}
// Keeps track of which page to load after the data is loaded.
var BF6SelectedPage = ""
// Keeps track of which page to load when loading from a querystring
var bf6PageToLoad = ""

/*
  Returns html RGB color code for given array
  Nicked from Stackoverflow #41310869
*/
function BF6ArrayToRGB(values) {
  return 'rgb(' + values.join(', ') + ')';
}

/*
  Interpolate color between two arrays.
  `ratio` specifies how much "rgb2" is in the color
*/
function BF6InterpolateRGB(rgb1, rgb2, ratio) {
  return rgb1.map((rgb1Val, i) => rgb1Val + (rgb2[i] - rgb1Val) * ratio)
}

/*
  Return weapon's damage at given point dist.
  damages and distances specify how much weapon
  does damage at those points, and everything
  else is linearly interpolated between.
*/
function BF6InterpolateDamage (dist, damages, distances) {
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
    // NOTE: BF6 uses "step" interpolation for all non-portal weapons, so we hardcode it here.
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
function BF6GetDamageOverDistance (weapon) {
  var damages = weapon['Damages']
  var distances = weapon['Dmg_distances']
  var damageOverDistance = []

  // Loop over distance and store damages
  for (var dist = BF6_DAMAGE_RANGE_START; dist <= BF6_DAMAGE_RANGE_END; dist += BF6_DAMAGE_RANGE_STEP) {
    damageOverDistance.push([dist, BF6InterpolateDamage(dist, damages, distances)])
  }
  return damageOverDistance
}

/*
  Return array of [distance, bullets],
  where length of the array is based on constants
  defined above
*/
function BF6GetBTKUpperBoundOverDistance (weapon) {
  var damages = weapon['Damages']
  var distances = weapon['Dmg_distances']
  var BTKUBOverDistance = []

  // Loop over distance and store damages
  var damageAtDist = 0
  for (var dist = BF6_DAMAGE_RANGE_START; dist <= BF6_DAMAGE_RANGE_END; dist += BF6_DAMAGE_RANGE_STEP) {
    damageAtDist = BF6InterpolateDamage(dist, damages, distances)
    BTKUBOverDistance.push([dist, Math.ceil(100 / (damageAtDist * BF6_MIN_DAMAGE_MULTIPLIER))])
  }
  return BTKUBOverDistance
}

/*
  Return array of [distance, milliseconds],
  where length of the array is based on constants
  defined above
*/
function BF6GetTTKUpperBoundOverDistance (weapon) {
  var damages = weapon['Damages']
  var distances = weapon['Dmg_distances']
  var numShots = weapon['ShotsPerShell']
  var msPerShot = 60000 / (weapon['RoF'])
  var TTKUBOverDistance = []

  // Loop over distance and store damages
  var damageAtDist = 0
  var bulletsToKill = 0
  for (var dist = BF6_DAMAGE_RANGE_START; dist <= BF6_DAMAGE_RANGE_END; dist += BF6_DAMAGE_RANGE_STEP) {
    // Assumption: All shots hit from a weapon with multiple shots
    damageAtDist = BF6InterpolateDamage(dist, damages, distances) * numShots
    // Floor because we do not need the last bullet
    // Small epsilon is added to fix situation with 100 damage (100 / 100 = 1)
    bulletsToKill = Math.floor(100 / (damageAtDist * BF6_MIN_DAMAGE_MULTIPLIER + 0.00001))

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
function BF6LoadSuccessCallback (data) {
  loadBF6Stylesheet()

  BF6WeaponData = data

  /*  uncomment to setup comparison page
  // Create name_to_data objects
  for (var i = 0; i < BF6WeaponData.length; i++) {
    BF6WeaponNameToData[BF6WeaponData[i]['codename']] = BF6WeaponData[i]
  }
  
  // All weapons should have same keys.
  // Take keys from the first weapon and store them as keys
  //BF6WeaponKeys = Object.keys(BF6WeaponData[0])
  // Sort keys for consistency between runs etc
  BF6WeaponKeys.sort()

  // Create BF6WeaponKeyToData
  var key
  for (var keyi = 0; keyi < BF6WeaponKeys.length; keyi++) {
    key = BF6WeaponKeys[keyi]
    var dataRow = []
    for (var weapi = 0; weapi < BF6WeaponData.length; weapi++) {
      dataRow.push(BF6WeaponData[weapi][key])
    }
    BF6WeaponKeyToData[key] = dataRow
  }
  BF6DataLoaded = true
*/


  // Proceed to appropriate page
  if (BF6SelectedPage === "BF6_CHART"){
    loadBF6ChartPage()
  } else if (BF6SelectedPage === "BF6_COMPARISON"){
    loadBF6ComparisonPage()
  }
}

/*
  Load BF6 data from the JSON file, and parse it
  into the global variables
*/
function BF6LoadWeaponData () {
  // TODO Add some kind of progress bar here?
  $.getJSON(BF6_DATA).done(BF6LoadSuccessCallback).fail(function (jqxhr, textStatus, error) {
    console.log('Loading BF6 data failed: ' + textStatus + ' , ' + error)
  })
}

/*
  Display BF6 page to user. This should be
  done after data has been successfully loaded
*/
function openBF6ComparisonPage () {
  if (BF6DataLoaded === false) {
    BF6SelectedPage = "BF6_COMPARISON"
    BF6LoadWeaponData()
  } else {
    loadBF6ComparisonPage()
  }
}

function loadBF6ComparisonPage(){
  $('.otherTitles-main-content').load('./pages/bf6/bf6_comparison.html', initializeBF6Comparison)
}

/*
  Load the BF6 chart page
*/
function openBF6ChartPage () {
  if (BF6DataLoaded === false) {
    BF6SelectedPage = "BF6_CHART"
    BF6LoadWeaponData()
  } else {
    loadBF6ChartPage()
    loadBF6Stylesheet()
  }
}

function loadBF6ChartPage(){
  $('.otherTitles-main-content').load('./pages/bf6/bf6_chart.html', BF6initializeChartPage)
}

function openBF6GeneralInfoPage () {
  $('.otherTitles-main-content').load('./pages/bf6/bf6_generalinfo.html')
}
/*
  Load the BF6 weapon data page
*/
function openBF6WeaponInfoPage () {
  $('.otherTitles-main-content').load('./pages/bf6/bf6_dataWeapon.html', function(){MathJax.typeset()})
}
