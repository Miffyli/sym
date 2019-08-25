// Path to datafile
const BFV_DATA = 'pages/bfv/data/bfv_d.json'

// Constants for BFV
// Constants for plotting damage/ttk/etc
const BFV_DAMAGE_RANGE_START = 0
const BFV_DAMAGE_RANGE_END = 120
const BFV_DAMAGE_RANGE_STEP = 1

// Minimum damage multiplier (9.1.2018)
const BFV_MIN_DAMAGE_MULTIPLIER = 1.0

// TODO should these variables be stored here?
//  They are convenient like this, but pollute
//  public namespace and may cause collisions

// A flag to tell if we have loaded BFV data already
var bfvDataLoaded = false
// This will be the main holder of all the weapon data.
// An array of dictionaries, each of which is a weapon
var bfvWeaponData = []
// This will be similar to data, except
// keys are the full weapon names (with attachments)
// and values are the weapons
var bfvWeaponNameToData = {}
// This will be all the keys available per weapon
// (i.e. variable names)
var bfvWeaponKeys = []
// Variable name -> array, where indexing is same as in
// bfvWeaponData
var bfvWeaponKeyToData = {}

/*
  Return weapon's damage at given point dist.
  damages and distances specify how much weapon
  does damage at those points, and everything
  else is interpolated between.
*/
function interpolateDamage (dist, damages, distances) {
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
function getDamageOverDistance (weapon) {
  var damages = weapon['Damages']
  var distances = weapon['Dmg_distances']
  var damageOverDistance = []

  // Loop over distance and store damages
  for (var dist = BFV_DAMAGE_RANGE_START; dist <= BFV_DAMAGE_RANGE_END; dist += BFV_DAMAGE_RANGE_STEP) {
    damageOverDistance.push([dist, interpolateDamage(dist, damages, distances)])
  }
  return damageOverDistance
}

/*
  Return array of [distance, bullets],
  where length of the array is based on constants
  defined above
*/
function getBTKUpperBoundOverDistance (weapon) {
  var damages = weapon['Damages']
  var distances = weapon['Dmg_distances']
  var BTKUBOverDistance = []

  // Loop over distance and store damages
  var damageAtDist = 0
  for (var dist = BFV_DAMAGE_RANGE_START; dist <= BFV_DAMAGE_RANGE_END; dist += BFV_DAMAGE_RANGE_STEP) {
    damageAtDist = interpolateDamage(dist, damages, distances)
    BTKUBOverDistance.push([dist, Math.ceil(100 / (damageAtDist * BFV_MIN_DAMAGE_MULTIPLIER))])
  }
  return BTKUBOverDistance
}

/*
  Return array of [distance, milliseconds],
  where length of the array is based on constants
  defined above
*/
function getTTKUpperBoundOverDistance (weapon) {
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
    damageAtDist = interpolateDamage(dist, damages, distances)
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
function bfvReadyCallback () {
  // TODO error messages if download / parsing failed.
  if (this.readyState === 4 && this.status === '200') {
    bfvWeaponData = JSON.parse(this.response)
    // Create name_to_data objects
    for (var i = 0; i < bfvWeaponData.length; i++) {
      bfvWeaponNameToData[bfvWeaponData[i]['WeapShowName']] = bfvWeaponData[i]
    }
    // All weapons should have same keys.
    // Take keys from the first weapon and store them as keys
    bfvWeaponKeys = Object.keys(bfvWeaponData[0])
    // Sort keys for consistency between runs etc
    bfvWeaponKeys.sort()

    // Create bfvWeaponKeyToData
    var key
    for (var keyi = 0; keyi < bfvWeaponKeys.length; keyi++) {
      key = bfvWeaponKeys[keyi]
      var dataRow = []
      for (var weapi = 0; weapi < bfvWeaponData.length; weapi++) {
        dataRow.push(bfvWeaponData[weapi][key])
      }
      bfvWeaponKeyToData[key] = dataRow
    }
  }
}

/*
  Load BFV data from the JSON file, and parse it
  into the global variables
*/
function bfvLoadWeaponData() {
  // TODO change to jQuery for simplicity
  var xobj = new XMLHttpRequest()
  xobj.overrideMimeType('application/json')
  xobj.open('GET', BFV_DATA, false)
  xobj.onreadystatechange = bfvReadyCallback
  xobj.send(null)
}

/*
  Entry function for BFV page
*/
function initializeBFVPage () {
  $('.sym-main-content').html(
  "<div style='text-align: center; padding: 150px; margin:auto; width: 400px;'>" +
    '<h1>Battlefield V Stats</h1>' +
    '<h4>Soon &trade;</h4>' +
  '</div>'
  )
  // Load data
  if (bfvDataLoaded === false) {
    bfvLoadWeaponData()
    bfvDataLoaded = true
  }
}
