// Path to datafile
const BFV_DATA = './pages/bfv/data/bfv_O.json'

// Manual dates when the data or pages have been modified.
// In format "[day] [month three letters] [year four digits]"
// e.g. 2nd Jan 2019
const BFV_DATA_DATE = '26th Jun 2020 (BFV_O)'
const BFV_PAGE_DATE = '15th Mar 2020'

// Total version string displayed under title
const BFV_VERSION_STRING = `Latest updates<br>Page: ${BFV_PAGE_DATE}<br>Data: ${BFV_DATA_DATE}`

// Constants for BFV
// Constants for plotting damage/ttk/etc
const BFV_DAMAGE_RANGE_START = 0
const BFV_DAMAGE_RANGE_END = 120
const BFV_DAMAGE_RANGE_STEP = 1

// Minimum damage multiplier (9.1.2018)
const BFV_MIN_DAMAGE_MULTIPLIER = 1.0

// Set of variables that should be considered worse
// if the number is lower
const BFV_LOWER_IS_WORSE = new Set([
  'SDmg',
  'EDmg',
  'RoF',
  'BRoF',
  'MagSize',
  'NumBulletsReloaded',
  'InitialSpeed',
  'InitialSpeedZ',
  'TimeToLive',
  'MaxDistance',
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
  'ADSStandBaseSpreadIdleOffset',
  'ShotsPerShell'
])

/* 
   Used by chart and comparison pages
   These mappings are used for the labels on the customization buttons
   These need to be updated if DICE comes out with new customization types.
*/
var customizationStrings = new Object();
customizationStrings.QADS = "Quick Aim";
customizationStrings.ADSM = "Custom Stock";
customizationStrings.MoAD = "Lightened Stock";
customizationStrings.Bayo = "Bayonet";
customizationStrings.QRel = "Quick Reload";
customizationStrings.QDep = "Slings and Swivels";
customizationStrings.QCyc = "Machined Bolt";
customizationStrings.Zero = "Variable Zeroing";
customizationStrings.VRec = "Recoil Buffer";
customizationStrings.ITri = "Trigger Job";
customizationStrings.Hipf = "Enhanced Grips";
customizationStrings.IADS = "Barrel Bedding";
customizationStrings.DMag = "Detachable Magazines";
customizationStrings.Bipo = "Bipod";
customizationStrings.FBul = "High Velocity Bullets";
customizationStrings.Long = "Low Drag Rounds";
customizationStrings.ADSS = "Barrel Bedding";
customizationStrings.HRec = "Ported Barrel";
customizationStrings.Heav = "Heavy Load";
customizationStrings.Pene = "Penetrating Shot";
customizationStrings.ExMa = "Extended Magazine";
customizationStrings.Slug = "Slugs";
customizationStrings.Head = "Solid Slug";
customizationStrings.IBip = "Improved Bipod";
customizationStrings.Flas = "Flashless Propellant";
customizationStrings.IROF = "Light Bolt";
customizationStrings.Ince = "Incendiary Bullets";
customizationStrings.Cool = "Chrome Lining";
customizationStrings.Magd = "Polished Action";
customizationStrings.Chok = "Internal Choke";
customizationStrings.ExBe = "Extended Belt";
customizationStrings.Drum = "Double Drum Magazine";
customizationStrings.Gren = "Improved Grenades"
customizationStrings.APCR = "APCR Bullets";
customizationStrings.QBCy = "Light Bolt";
customizationStrings.BROF = "Trigger Job";
customizationStrings.GLau = 'Grenade Launcher'
customizationStrings.Fire = 'Fully Automatic Fire'
customizationStrings.QCyP = 'Machined Bolt'
customizationStrings.Supp = 'Suppressor'
customizationStrings.TopU = 'Top Up'
customizationStrings.HiPo = 'High Power Optics'

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
// Keeps track of which page to load when loading from a querystring
var bfvPageToLoad = ""


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
  var numShots = weapon['ShotsPerShell']
  var msPerShot = 60000 / (weapon['RoF'])
  if (weapon['BRoF'] != weapon['RoF']) {
    msPerShot = 60000 / (weapon['BRoF'])
  }
  var TTKUBOverDistance = []

  // Loop over distance and store damages
  var damageAtDist = 0
  var msToTarget = 0
  var bulletsToKill = 0
  // Used to track how long bullet has been flying
  var bulletFlightSeconds = 0.0
  for (var dist = BFV_DAMAGE_RANGE_START; dist <= BFV_DAMAGE_RANGE_END; dist += BFV_DAMAGE_RANGE_STEP) {
    // Assumption: All shots hit from a weapon with multiple shots
    damageAtDist = BFVInterpolateDamage(dist, damages, distances) * numShots
    // Floor because we do not need the last bullet
    // Small epsilon is added to fix situation with 100 damage (100 / 100 = 1)
    bulletsToKill = Math.floor(100 / (damageAtDist * BFV_MIN_DAMAGE_MULTIPLIER + 0.00001))

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
  loadPageWithHeader('./pages/bfv/bfv_header.html', 'Battlefield V', initializeBFVSelection, BFV_VERSION_STRING)
}

function openBFVSelectionPageFromQueryString(pageStr){
  bfvPageToLoad = pageStr
  loadPageWithHeader('./pages/bfv/bfv_header.html', 'Battlefield V', BFVLoadPageFromQueryString, BFV_VERSION_STRING)
}

/*
  Load the BFV main/entry/index page
*/
function openBFVIndexPage () {
  $('.bfv-main-content').load('./pages/bfv/bfv_index.html', BFVinitializeIndexPage)
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
    loadBFVStylesheet()
  }
}

function loadBFVChartPage(){
    $('.bfv-main-content').load('./pages/bfv/bfv_chart.html', BFVinitializeChartPage)
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
  Main hub for opening different BFV pages based on their name.
  Handles coloring of the buttons etc
*/
function BFVOpenPageByName(pageName) {
  // Remove highlighting
  $('.sym-pageSelections > div').removeClass('selected-selector')
  $('.bfv-main-content').html("<div class='sym-loading'>Loading...</div>")
  // Select right page according to pageName, highlight its
  // button and open the page
  if (pageName === 'Weapon Charts') {
    $('#bfv-chartPageSelector').addClass('selected-selector')
    openBFVChartPage()
    updateQueryString("bfv", "charts")
  } else if (pageName === 'Weapon Comparison') {
    $('#bfv-comparisonPageSelector').addClass('selected-selector')
    openBFVComparisonPage()
    updateQueryString("bfv", "comparison")
  } else if (pageName === 'General Information') {
    $('#bfv-generalinfoPageSelector').addClass('selected-selector')
    openBFVGeneralInfoPage()
    updateQueryString("bfv", "general-info")
  } else if (pageName === 'Equipment Data') {
    $('#bfv-equipmentPageSelector').addClass('selected-selector')
    openBFVEquipmentPage()
    updateQueryString("bfv", "equipment")
  } else if (pageName === 'Index') {
    $('#bfv-mainPageSelector').addClass('selected-selector')
    openBFVIndexPage()
    updateQueryString("bfv", "index")
  } else if (pageName === 'Weapon Mechanics') {
    $('#bfv-weaponPageSelector').addClass('selected-selector')
    openBFVWeaponPage()
    updateQueryString("bfv", "weapon-mechanics")
  }
}

/*
  Add handlers for the click events for the bfv selector page and open
  the entry page for BFV
*/
function initializeBFVSelection () {
  BFVSetupPageHeader()
  openBFVIndexPage()
}

/*
  Add handlers for the click events for the bfv index page
*/
function BFVinitializeIndexPage(){
  $('.indexPageItem').click(function () {
    console.log("hererere")
      var itemClicked = $(this).find("h4").text()
      // TODO slippery slope: If title on the buttons changes,
      //                      it will break opening the page
      BFVOpenPageByName(itemClicked)
  })
}


function BFVSetupPageHeader(){
  loadBFVStylesheet()  
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
    }
    BFVOpenPageByName(pageName)
  })
}

function BFVLoadPageFromQueryString(){
  BFVSetupPageHeader()
  BFVOpenPageByName(bfvPageToLoad)
}

/*
  Add handlers for the click events for the bfv index page
*/
function BFVinitializeIndexPage(){
  $('.indexPageItem').click(function () {
    console.log("hererere")
      var itemClicked = $(this).find("h4").text()
      // TODO slippery slope: If title on the buttons changes,
      //                      it will break opening the page
      BFVOpenPageByName(itemClicked)
  })
}

/*
  Hackish fix to accomodate the M1 Garand having 3 tier 4 customizations.  We are replacing Bayonet with Heavy Load
  since Bayonets don't affect weapon stats.
*/
function BFVSwitchBayoToHeav(custString, weaponName){
  if(weaponName == "M1 Garand"){
    custString = custString.replace(/Bayonet/g, 'Heavy Load')
    custString = custString.replace(/Bayo/g, "Heav")
  }

  return custString
}
