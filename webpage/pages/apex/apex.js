// Path to datafile
// const APEX_DATA = './pages/apex/data/apex_B.json'
const APEX_DATA = './pages/apex/data/apex_test.json';
// Constants for APEX
// Constants for plotting damage/ttk/etc
const APEX_DAMAGE_RANGE_START = 0;
const APEX_DAMAGE_RANGE_END = 120;
const APEX_DAMAGE_RANGE_STEP = 1;

// Minimum damage multiplier (9.1.2018)
const APEX_MIN_DAMAGE_MULTIPLIER = 1.0;

// A flag to tell if we have loaded APEX data already
var APEXDataLoaded = false;
// This will be the main holder of all the weapon data.
// An array of dictionaries, each of which is a weapon
var APEXWeaponData = [];
// This will be similar to data, except
// keys are the full weapon names (with attachments)
// and values are the weapons
var APEXWeaponNameToData = {};
// This will be all the keys available per weapon
// (i.e. variable names)
var APEXWeaponKeys = [];
// Variable name -> array, where indexing is same as in
// APEXWeaponData
var APEXWeaponKeyToData = {};
// Keeps track of which page to load after the data is loaded.
var APEXSelectedPage = "";

function Thing(x, y)
{
  this.x = x;
  this.y = y;
}

var mousePos = new Thing(0, 0);
// document.getElementsByClassName()
// mydiv = document.getElementsByClassName("apex-main-content");
// mycanvas = document.getElementById("mycanvas");
//
// mydiv.addEventListener('mousemove', function(event)
// {
//   mousePos.x = event.clientX;
//   mousePos.y = event.clientY;
//
//   mycanvas.style.top = mousePos.y + "px";
//   mycanvas.style.left = mousePos.x + "px";
//   console.log(mycanvas.style);
// }, false);

/*
  Returns html RGB color code for given array
  Nicked from Stackoverflow #41310869
*/
function APEXArrayToRGB(values) {
  return 'rgb(' + values.join(', ') + ')';
}

/*
  Interpolate color between two arrays.
  `ratio` specifies how much "rgb2" is in the color
*/
function APEXInterpolateRGB(rgb1, rgb2, ratio) {
  return rgb1.map((rgb1Val, i) => rgb1Val + (rgb2[i] - rgb1Val) * ratio)
}

/*
  Return weapon's damage at given point dist.
  damages and distances specify how much weapon
  does damage at those points, and everything
  else is linearly interpolated between.
*/
function APEXInterpolateDamage (dist, damages, distances) {
  if (dist <= Math.min.apply(null, distances)) {
    return damages[0]
  } else if (dist >= Math.max.apply(null, distances)) {
    return damages[damages.length - 1]
  } else {
    // Find the neighboring points
    var prevDist = undefined;
    var nextDist = undefined;
    var prevDmg = undefined;
    var nextDmg = undefined;
    for (var i = 0; i < distances.length; i++) {
      if (dist >= distances[i]) {
        prevDist = distances[i];
        prevDmg = damages[i];
        nextDist = distances[i + 1];
        nextDmg = damages[i + 1]
      }
    }
    // Interpolate the two
    var interpolated = prevDmg + ((dist - prevDist) / (nextDist - prevDist)) * (nextDmg - prevDmg);
    return interpolated
  }
}

/*
  Return array of [distance, damage],
  where length of the array is based on constants
  defined above
*/
function APEXGetDamageOverDistance (weapon) {
  var damages = weapon['damage_array'];
  var distances = weapon['damage_distance_array_m'];
  var damageOverDistance = [];

  // Loop over distance and store damages
  for (var dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {
    damageOverDistance.push([dist, APEXInterpolateDamage(dist, damages, distances)])
  }
  return damageOverDistance
}

/*
  Return array of [distance, bullets],
  where length of the array is based on constants
  defined above
*/
function APEXGetBTKUpperBoundOverDistance (weapon) {
  var damages = weapon['damage_array'];
  var distances = weapon['damage_distance_array_m'];
  var BTKUBOverDistance = [];

  // Loop over distance and store damages
  var damageAtDist = 0;
  for (var dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {
    damageAtDist = APEXInterpolateDamage(dist, damages, distances);
    BTKUBOverDistance.push([dist, Math.ceil(100 / (damageAtDist * APEX_MIN_DAMAGE_MULTIPLIER))])
  }
  return BTKUBOverDistance
}

function APEXGetWhiteBTKUpperBoundOverDistance (weapon) {
  var damages = weapon['damage_array'];
  var distances = weapon['damage_distance_array_m'];
  var WhiteBTKUBOverDistance = [];

  // Loop over distance and store damages
  var damageAtDist = 0;
  for (var dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {
    damageAtDist = APEXInterpolateDamage(dist, damages, distances);
    WhiteBTKUBOverDistance.push([dist, Math.ceil(150 / (damageAtDist * APEX_MIN_DAMAGE_MULTIPLIER))])
  }
  return WhiteBTKUBOverDistance
}

function APEXGetBlueBTKUpperBoundOverDistance (weapon) {
  var damages = weapon['damage_array'];
  var distances = weapon['damage_distance_array_m'];
  var BlueBTKUBOverDistance = [];

  // Loop over distance and store damages
  var damageAtDist = 0;
  for (var dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {
    damageAtDist = APEXInterpolateDamage(dist, damages, distances);
    BlueBTKUBOverDistance.push([dist, Math.ceil(175 / (damageAtDist * APEX_MIN_DAMAGE_MULTIPLIER))])
  }
  return BlueBTKUBOverDistance
}

function APEXGetPurpleBTKUpperBoundOverDistance (weapon) {
  var damages = weapon['damage_array'];
  var distances = weapon['damage_distance_array_m'];
  var PurpleBTKUBOverDistance = [];

  // Loop over distance and store damages
  var damageAtDist = 0;
  for (var dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {
    damageAtDist = APEXInterpolateDamage(dist, damages, distances);
    PurpleBTKUBOverDistance.push([dist, Math.ceil(200 / (damageAtDist * APEX_MIN_DAMAGE_MULTIPLIER))])
  }
  return PurpleBTKUBOverDistance
}

/*
  Return array of [distance, milliseconds],
  where length of the array is based on constants
  defined above
*/
function APEXGetTTKUpperBoundOverDistance (weapon) {
  var damages = weapon['damage_array'];
  var distances = weapon['damage_distance_array_m'];
  var bulletVelocity = weapon['projectile_launch_speed'] / 39.3701;
  var bulletDrag = 0.0; // weapon['projectile_drag_coefficient'];
  if(weapon['effective_fire_rate'] != undefined){
    var msPerShot = 60000 / (weapon['effective_fire_rate']);
  } else {
    var msPerShot = 1000 / (weapon['fire_rate']);
  }
  // var msPerShot = 60000 / (weapon['effective_fire_rate']);
  // var msPerShot = 1000 / (weapon['fire_rate']);
  var TTKUBOverDistance = [];

  // Loop over distance and store damages
  var damageAtDist = 0;
  var msToTarget = 0;
  var bulletsToKill = 0;
  // Used to track how long bullet has been flying
  var bulletFlightSeconds = 0.0;
  for (var dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {
    damageAtDist = APEXInterpolateDamage(dist, damages, distances);
    // Floor because we do not need the last bullet
    bulletsToKill = Math.floor(100 / (damageAtDist * APEX_MIN_DAMAGE_MULTIPLIER));

    msToTarget = bulletFlightSeconds * 1000;
    // Update bullet velocity and time we are flying
    bulletFlightSeconds += APEX_DAMAGE_RANGE_STEP / bulletVelocity;
    // Update according to drag
    bulletVelocity -= (Math.pow(bulletVelocity, 2) * bulletDrag) * (APEX_DAMAGE_RANGE_STEP / bulletVelocity);

    // The only time from bullet flight comes from the last bullet that lands on the enemy,
    // hence we only add msToTarget once
    // console.log(dist, (bulletsToKill * msPerShot + msToTarget));
    TTKUBOverDistance.push([dist, bulletsToKill * msPerShot + msToTarget])
  }
  return TTKUBOverDistance
}

function APEXGetWhiteTTKUpperBoundOverDistance (weapon) {
  var damages = weapon['damage_array'];
  var distances = weapon['damage_distance_array_m'];
  var bulletVelocity = weapon['projectile_launch_speed'] / 39.3701;
  var bulletDrag = 0.0; // weapon['projectile_drag_coefficient'];
  if(weapon['effective_fire_rate'] != undefined){
    var msPerShot = 60000 / (weapon['effective_fire_rate']);
  } else {
    var msPerShot = 1000 / (weapon['fire_rate']);
  }
  // var msPerShot = 60000 / (weapon['effective_fire_rate']);
  // var msPerShot = 1000 / (weapon['fire_rate']);
  var WhiteTTKUBOverDistance = [];

  // Loop over distance and store damages
  var damageAtDist = 0;
  var msToTarget = 0;
  var bulletsToKill = 0;
  // Used to track how long bullet has been flying
  var bulletFlightSeconds = 0.0;
  for (var dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {
    damageAtDist = APEXInterpolateDamage(dist, damages, distances);
    // Floor because we do not need the last bullet
    bulletsToKill = Math.floor(150 / (damageAtDist * APEX_MIN_DAMAGE_MULTIPLIER));

    msToTarget = bulletFlightSeconds * 1000;
    // Update bullet velocity and time we are flying
    bulletFlightSeconds += APEX_DAMAGE_RANGE_STEP / bulletVelocity;
    // Update according to drag
    bulletVelocity -= (Math.pow(bulletVelocity, 2) * bulletDrag) * (APEX_DAMAGE_RANGE_STEP / bulletVelocity);

    // The only time from bullet flight comes from the last bullet that lands on the enemy,
    // hence we only add msToTarget once
    console.log(dist, (bulletsToKill * msPerShot + msToTarget));
    WhiteTTKUBOverDistance.push([dist, bulletsToKill * msPerShot + msToTarget])
  }
  return WhiteTTKUBOverDistance
}

function APEXGetBlueTTKUpperBoundOverDistance (weapon) {
  var damages = weapon['damage_array'];
  var distances = weapon['damage_distance_array_m'];
  var bulletVelocity = weapon['projectile_launch_speed'] / 39.3701;
  var bulletDrag = 0.0; // weapon['projectile_drag_coefficient'];
  if(weapon['effective_fire_rate'] != undefined){
    var msPerShot = 60000 / (weapon['effective_fire_rate']);
  } else {
    var msPerShot = 1000 / (weapon['fire_rate']);
  }
  // var msPerShot = 60000 / (weapon['effective_fire_rate']);
  // var msPerShot = 1000 / (weapon['fire_rate']);
  var BlueTTKUBOverDistance = [];

  // Loop over distance and store damages
  var damageAtDist = 0;
  var msToTarget = 0;
  var bulletsToKill = 0;
  // Used to track how long bullet has been flying
  var bulletFlightSeconds = 0.0;
  for (var dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {
    damageAtDist = APEXInterpolateDamage(dist, damages, distances);
    // Floor because we do not need the last bullet
    bulletsToKill = Math.floor(175 / (damageAtDist * APEX_MIN_DAMAGE_MULTIPLIER));

    msToTarget = bulletFlightSeconds * 1000;
    // Update bullet velocity and time we are flying
    bulletFlightSeconds += APEX_DAMAGE_RANGE_STEP / bulletVelocity;
    // Update according to drag
    bulletVelocity -= (Math.pow(bulletVelocity, 2) * bulletDrag) * (APEX_DAMAGE_RANGE_STEP / bulletVelocity);

    // The only time from bullet flight comes from the last bullet that lands on the enemy,
    // hence we only add msToTarget once
    // console.log(dist, (bulletsToKill * msPerShot + msToTarget), "velocity: ", bulletVelocity);
    BlueTTKUBOverDistance.push([dist, bulletsToKill * msPerShot + msToTarget])
  }
  return BlueTTKUBOverDistance
}

function APEXGetPurpleTTKUpperBoundOverDistance (weapon) {
  var damages = weapon['damage_array'];
  var distances = weapon['damage_distance_array_m'];
  var bulletVelocity = weapon['projectile_launch_speed'] / 39.3701;
  var bulletDrag = 0.0; // weapon['projectile_drag_coefficient'];
  if(weapon['effective_fire_rate'] != undefined){
    var msPerShot = 60000 / (weapon['effective_fire_rate']);
  } else {
    var msPerShot = 1000 / (weapon['fire_rate']);
  }
  // var msPerShot = 60000 / (weapon['effective_fire_rate']);
  // var msPerShot = 1000 / (weapon['fire_rate']);
  var PurpleTTKUBOverDistance = [];

  // Loop over distance and store damages
  var damageAtDist = 0;
  var msToTarget = 0;
  var bulletsToKill = 0;
  // Used to track how long bullet has been flying
  var bulletFlightSeconds = 0.0;
  for (var dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {
    damageAtDist = APEXInterpolateDamage(dist, damages, distances);
    // Floor because we do not need the last bullet
    bulletsToKill = Math.floor(200 / (damageAtDist * APEX_MIN_DAMAGE_MULTIPLIER));

    msToTarget = bulletFlightSeconds * 1000;
    // Update bullet velocity and time we are flying
    bulletFlightSeconds += APEX_DAMAGE_RANGE_STEP / bulletVelocity;
    // Update according to drag
    bulletVelocity -= (Math.pow(bulletVelocity, 2) * bulletDrag) * (APEX_DAMAGE_RANGE_STEP / bulletVelocity);

    // The only time from bullet flight comes from the last bullet that lands on the enemy,
    // hence we only add msToTarget once
    // console.log(dist, (bulletsToKill * msPerShot + msToTarget));
    PurpleTTKUBOverDistance.push([dist, bulletsToKill * msPerShot + msToTarget])
  }
  return PurpleTTKUBOverDistance
}

/*
  Function to handle JSON data upon receiving it:
  Parse JSON data and preprocess it into different
  arrays.
*/
function APEXLoadSuccessCallback (data) {
  APEXWeaponData = data;
  // Create name_to_data objects
  for (var i = 0; i < APEXWeaponData.length; i++) {
    if (APEXWeaponData[i] != "WeaponViewkickPatterns"){
      APEXWeaponNameToData[APEXWeaponData[i]['printname']] = APEXWeaponData[i]
    }
  }
  // All weapons should have same keys.
  // Take keys from the first weapon and store them as keys
  APEXWeaponKeys = Object.keys(APEXWeaponData[0].WeaponData);
  // Sort keys for consistency between runs etc
  APEXWeaponKeys.sort();

  // Create APEXWeaponKeyToData
  var key;
  for (var keyi = 0; keyi < APEXWeaponKeys.length; keyi++) {
    key = APEXWeaponKeys[keyi];
    var dataRow = [];
    for (var weapi = 0; weapi < APEXWeaponData.length; weapi++) {
      dataRow.push(APEXWeaponData[weapi][key])
    }
    APEXWeaponKeyToData[key] = dataRow
  }
  APEXDataLoaded = true;

  // Proceed to appropriate page
  if (APEXSelectedPage === "APEX_CHART"){
    loadAPEXChartPage()
  } else if (APEXSelectedPage === "APEX_COMPARISON"){
    loadAPEXComparisonPage()
  }
}

/*
  Load APEX data from the JSON file, and parse it
  into the global variables
*/
function APEXLoadWeaponData () {
  // TODO Add some kind of progress bar here?
  $.getJSON(APEX_DATA).done(APEXLoadSuccessCallback).fail(function (jqxhr, textStatus, error) {
    console.log('Loading APEX data failed: ' + textStatus + ' , ' + error)
  })
}

/*
  Entry function for APEX page. Load data first,
  and then open APEX page for user.
*/
function initializeAPEXComparisonPage () {
  // Attempt loading APEX data. After that is done,
  // we move onto opening the webpage (`openAPEXPage`).
  if (APEXDataLoaded === false) {
    APEXLoadWeaponData()
  } else {
    openAPEXComparisonPage()
  }
}

/*
  Load the APEX selector page that contains the buttons to allow
  the user to select which page to navigate to (chart, comp, etc...).
*/
function openAPEXSelectionPage () {
  loadPageWithHeader('./pages/apex/apex_header.html', 'Apex Legends', initializeAPEXSelectrion)
}

/*
  Load the APEX main/entry/index page
*/
function openAPEXIndexPage () {
  $('.apex-main-content').load('./pages/apex/apex_index.html', initializeIndexPage)
}

/*
  Load the APEX General Info page
*/
function openAPEXGeneralInfoPage () {
  $('.apex-main-content').load('./pages/apex/apex_generalinfo.html')
}

/*
  Load the APEX weapon data page
*/
function openAPEXWeaponPage () {
  $('.apex-main-content').load('./pages/apex/apex_dataWeapon.html', function(){MathJax.typeset()})
}

/*
  Load the APEX chart page
*/
function openAPEXChartPage () {
  if (APEXDataLoaded === false) {
    APEXSelectedPage = "APEX_CHART";
    APEXLoadWeaponData()
  } else {
    loadAPEXChartPage()
  }
}

function loadAPEXChartPage(){
    $('.apex-main-content').load('./pages/apex/apex_chart.html', apex_initializeChartPage)

}

/*
  Display APEX page to user. This should be
  done after data has been successfully loaded
*/
function openAPEXComparisonPage () {
  if (APEXDataLoaded === false) {
    APEXSelectedPage === "APEX_COMPARISON";
    APEXLoadWeaponData()
  } else {
    loadAPEXComparisonPage()
  }
}

function loadAPEXComparisonPage(){
  $('.apex-main-content').load('./pages/apex/apex_comparison.html', initializeAPEXComparison)
}
/*
  Load the APEX equipment data page
*/
function openAPEXEquipmentPage () {
  $('.apex-main-content').load('./pages/apex/apex_dataEquipment.html')
}
/*
Display APEX page to user. This should be
done after data has been successfully loaded
*/
function openAPEXRecoilPatternPage () {
  if (APEXDataLoaded === false) {
    APEXSelectedPage === "APEX_RECOILPATTERN";
    APEXLoadWeaponData()
  } else {
    loadAPEXRecoilPatternPage()
  }
}
/*
  Load the APEX vehicle data page
*/
function loadAPEXRecoilPatternPage () {
  $('.apex-main-content').load('./pages/apex/recoilpatterns/apex_recoilPatterns.html', apex_initializeRecoilPage)
}

/*
  Main hub for opening different APEX pages based on their name.
  Handles coloring of the buttons etc
*/
function APEXOpenPageByName(pageName) {
  // Remove highlighting
  $('.sym-pageSelections > div').removeClass('selected-selector');
  // Select right page according to pageName, highlight its
  // button and open the page
  if (pageName === 'Weapon Charts') {
    $('#apex-chartPageSelector').addClass('selected-selector');
    openAPEXChartPage()
  } else if (pageName === 'Weapon Comparison') {
    $('#apex-comparisonPageSelector').addClass('selected-selector');
    initializeAPEXComparisonPage()
  } else if (pageName === 'General Information') {
    $('#apex-generalinfoPageSelector').addClass('selected-selector');
    openAPEXGeneralInfoPage()
  } else if (pageName === 'Equipment Data') {
    $('#apex-equipmentPageSelector').addClass('selected-selector');
    openAPEXEquipmentPage()
  } else if (pageName === 'Recoil Patterns') {
    $('#apex-recoilPatternPageSelector').addClass('selected-selector');
    openAPEXRecoilPatternPage()
  } else if (pageName === 'Index') {
    $('#apex-mainPageSelector').addClass('selected-selector');
    openAPEXIndexPage()
	} else if (pageName === 'Weapon Mechanics') {
    $('#apex-weaponPageSelector').addClass('selected-selector');
    openAPEXWeaponPage()
  }
}

/*
  Add handlers for the click events for the apex selector page and open
  the entry page for APEX
*/
function initializeAPEXSelectrion () {
  $('.sym-pageSelections > div').click(function () {
    var clicked = $(this).attr('id');
    var pageName;
    if (clicked === 'apex-chartPageSelector') {
      pageName = 'Weapon Charts'
    } else if (clicked === 'apex-comparisonPageSelector') {
      pageName = 'Weapon Comparison'
    } else if (clicked === 'apex-mainPageSelector') {
      pageName = 'Index'
	} else if (clicked === 'apex-generalinfoPageSelector') {
      pageName = 'General Information'
	} else if (clicked === 'apex-equipmentPageSelector') {
      pageName = 'Equipment Data'
	} else if (clicked === 'apex-weaponPageSelector') {
      pageName = 'Weapon Mechanics'
    } else if (clicked === 'apex-recoilPatternPageSelector') {
      pageName = 'Recoil Patterns'
    }
    APEXOpenPageByName(pageName)
  });
  openAPEXIndexPage()
}

/*
  Add handlers for the click events for the apex index page
*/
function initializeIndexPage(){
  $('.indexPageItem').click(function () {
      var itemClicked = $(this).find("h4").text();
      // TODO slippery slope: If title on the buttons changes,
      //                      it will break opening the page
      APEXOpenPageByName(itemClicked)
  })
}
