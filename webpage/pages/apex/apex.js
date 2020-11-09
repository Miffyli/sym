// Path to datafile
// const APEX_DATA = './pages/apex/data/apex_data_r5-61_J150_CL625858.json';
const APEX_DATA = './pages/apex/data/apex_data_r5-70_J171_CL673614.json';

// Manual dates when the data or pages have been modified.
// In format "[day] [month three letters] [year four digits]"
// e.g. 2nd Jan 2019
const APEX_DATA_DATE = '04th Nov 2020 (apex_data_r5-70_J171_CL673614)'
const APEX_PAGE_DATE = '09th Nov 2020'

// Total version string displayed under title
const APEX_VERSION_STRING = `Latest updates<br>Page: ${APEX_PAGE_DATE}<br>Data: ${APEX_DATA_DATE}`

// Constants for APEX
// Constants for plotting damage/ttk/etc
const APEX_DAMAGE_RANGE_START = 0;
const APEX_DAMAGE_RANGE_END = 120;
const APEX_DAMAGE_RANGE_STEP = 1;

// Minimum damage multiplier (9.1.2018)
const APEX_MIN_DAMAGE_MULTIPLIER = 1.0;

const APEX_LOWER_IS_WORSE = new Set( [
  'viewkick_pattern_data_y_avg',
  'viewkick_pattern_data_x_avg',
  'viewkick_pattern_data_x_min',
  'ads_move_speed_scale',
  'allow_headshots',
  'ammo_clip_size',
  'ammo_default_total',
  'ammo_stockpile_max',
  'blast_pattern_zero_distance_m',
  'blast_pattern_zero_distance',
  'bolt_gravity_enabled',
  'bolt_hitsize_grow1_size',
  'bolt_hitsize_grow2_size',
  'bolt_hitsize_growfinal_size',
  'bolt_hitsize',
  'bolt_zero_distance_m',
  'bolt_zero_distance',
  'burn_damage',
  'burn_stack_debounce',
  'burn_stacks_max',
  'burn_time',
  'charge_level_base',
  'charge_levels',
  'charge_remain_full_when_fired',
  'critical_hit_damage_scale',
  'critical_hit',
  'damage_array',
  'damage_distance_array_m',
  'damage_distance_array',
  'damage_far_distance',
  'damage_far_value_titanarmor',
  'damage_far_value',
  'damage_flags',
  'damage_headshot_scale',
  'damage_leg_scale',
  'damage_near_distance',
  'damage_near_value_titanarmor',
  'damage_near_value',
  'damage_rodeo',
  'damage_shield_scale',
  'damage_type',
  'damage_unshielded_scale',
  'damage_very_far_distance',
  'damage_very_far_value_titanarmor',
  'damage_very_far_value',
  'effective_fire_rate',
  'explosion_damage',
  'explosion_damages_owner',
  'explosion_inner_radius',
  'explosionradius',
  'fire_rate_max',
  'fire_rate',
  'headshot_distance_m',
  'headshot_distance',
  'pass_through_damage_preserved_scale',
  'pass_through_depth',
  'primary_attack_ignores_spread',
  'primary_fire_does_not_block_sprint',
  'projectile_launch_speed_m',
  'projectile_launch_speed',
  'projectile_lifetime',
  'projectile_ricochet_max_count',
  'projectiles_per_shot',
  'reload_enabled',
  'spread_decay_rate',
  'spread_moving_decay_rate',
  'sustained_discharge_allow_melee',
  'sustained_discharge_duration',
  'sustained_discharge_ends_in_primary_attack',
  'sustained_discharge_pulse_frequency',
  'sustained_discharge_updates_charge',
  'sustained_laser_damage_scale',
  'sustained_laser_enabled',
  'sustained_laser_impact_distance',
  'sustained_laser_radial_iterations',
  'sustained_laser_radial_step',
  'sustained_laser_radius',
  'sustained_laser_range',
  'viewdrift_ads_delay',
  'viewkick_scale_valueDecayRate',
  'zoom_fov',
  'zoom_toggle_fov'
]);

// A flag to tell if we have loaded APEX data already
let APEXDataLoaded = false;
// This will be the main holder of all the weapon data.
// An array of dictionaries, each of which is a weapon
let APEXWeaponData = [];
let APEXWeaponData_orig = [];
// This will be similar to data, except
// keys are the full weapon names (with attachments)
// and values are the weapons
const APEXWeaponNameToData = {};
// This will be all the keys available per weapon
// (i.e. variable names)
let APEXWeaponKeys = [];
// Variable name -> array, where indexing is same as in
// APEXWeaponData
const APEXWeaponKeyToData = {};
// Keeps track of which page to load after the data is loaded.
let APEXSelectedPage = "";
// Keeps track of which page to load when loading from a querystring
let apexPageToLoad = "";

let apex_attachments = {};
let active_weapon_attachments = {};
let optic_customizations = {};
const apex_weapon_name_dict = {
  "Alternator": "WPN_ALTERNATOR_SMG",
  // "B3": "WPN_WINGMAN",
  "Wingman": "WPN_WINGMAN",
  "Charge Rifle": "WPN_CHARGE_RIFLE",
  "Devotion": "WPN_ESAW",
  "EVA-8 Auto": "WPN_SHOTGUN",
  "G7 Scout": "WPN_G2",
  "HAVOC": "WPN_ENERGY_AR",
  "Hemlok": "WPN_HEMLOK",
  "Kraber": "WPN_SNIPER",
  "L-STAR": "WPN_LSTAR",
  "Longbow": "WPN_DMR",
  "M600 Spitfire": "WPN_LMG",
  "Mastiff": "WPN_MASTIFF",
  "Mozambique": "WPN_SHOTGUN_PISTOL",
  "P2020": "WPN_P2011",
  "Peacekeeper": "WPN_ENERGY_SHOTGUN",
  "Prowler": "WPN_PDW",
  "R-301": "WPN_RSPN101",
  "R-99": "WPN_R97",
  "RE-45": "WPN_RE45_AUTOPISTOL",
  "Triple Take": "WPN_DOUBLETAKE",
  "VK-47 Flatline": "WPN_VINSON",
  "Volt": "WPN_VOLT_SMG",
  "Emplaced Minigun": "WPN_MOUNTED_TURRET_WEAPON",
  "Sentinel": "WPN_SENTINEL",
  "WPN_ALTERNATOR_SMG": "Alternator",
  "WPN_WINGMAN": "Wingman",
  "WPN_CHARGE_RIFLE": "Charge Rifle",
  "WPN_ESAW": "Devotion",
  "WPN_SHOTGUN": "EVA-8 Auto",
  "WPN_G2": "G7 Scout",
  "WPN_ENERGY_AR": "HAVOC",
  "WPN_HEMLOK": "Hemlok",
  "WPN_SNIPER": "Kraber",
  "WPN_LSTAR": "L-STAR",
  "WPN_DMR": "Longbow",
  "WPN_LMG": "M600 Spitfire",
  "WPN_MASTIFF": "Mastiff",
  "WPN_SHOTGUN_PISTOL": "Mozambique",
  "WPN_P2011": "P2020",
  "WPN_ENERGY_SHOTGUN": "Peacekeeper",
  "WPN_PDW": "Prowler",
  "WPN_RSPN101": "R-301",
  "WPN_R97": "R-99",
  "WPN_RE45_AUTOPISTOL": "RE-45",
  "WPN_DOUBLETAKE": "Triple Take",
  "WPN_VINSON": "VK-47 Flatline",
  "WPN_VOLT_SMG": "Volt",
  "WPN_MOUNTED_TURRET_WEAPON": "Emplaced Minigun",
  "WPN_SENTINEL": "Sentinel"};

const APEXShield_HP = {"None": 0, "White": 50, "Blue": 75, "Purple": 100, "Gold": 100, "Red": 125};

/*
  Returns html RGB color code for given array
  Nicked from Stack overflow #41310869
*/
/**
 * @return {string}
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

function getHSMulti(weapon) {
  if ( weapon['allow_headshots'] === "1" && use_headshot_calculations ) {
    return weapon['damage_headshot_scale'];
  } else {
    return 1.0;
  }
}

function getAmpedMulti(weapon) {
  if (use_amped_calculations ) {
    return weapon['damage_headshot_scale'];
  } else {
    return 1.0;
  }
}

function getProjectilePerShot(weapon){
  let projectiles_per_shot = weapon['projectiles_per_shot'];
  if(projectiles_per_shot !== undefined) {
    return projectiles_per_shot
  } else {
    return 1
  }
}

// TODO: Figure out how to work unshielded damage multipliers into BTK/TTK functions that currently treat shields and HP the same.
function getUnShieldedDamageScale(weapon) {
  let damage_unshielded_scale = weapon['damage_unshielded_scale'];
  if(damage_unshielded_scale !== undefined) {
    return Number(damage_unshielded_scale)
  } else {
    return 1
  }
}

function getShieldedDamageScale(weapon) {
  let damage_shield_scale = weapon['damage_shield_scale'];
  if(damage_shield_scale !== undefined) {
    return Number(damage_shield_scale)
  } else {
    return 1
  }
}

function getMaxHSDist(weapon) {
  let hs_dist_float = weapon['headshot_distance_m'];
  if(hs_dist_float !== undefined) {
    return hs_dist_float
  } else {
    return APEX_DAMAGE_RANGE_END
  }
}

function getLimbMulti(weapon) {
  if ( use_ls_multi_calculations && !use_low_profile_calculations) {
    return weapon['damage_leg_scale'];
  } else {
    return 1.0;
  }
}

function getLegendDamageMulti(){
  if (use_fortified_calculations) {
    return 0.85
  } else if ( use_low_profile_calculations) {
    return 1.05
  } else {
    return 1.0
  }
}

// Note: Currently amped multi is the same across all damage dist ranges.
// If that changes the multi will need to be per distance like the headshot multi.
function getProjectileAmpedMulti(weapon){
  if (use_amped_calculations){
    return Number(weapon['Mods']['amped_damage']['damage_near_value'].substring(1))
  } else {
    return 1.0
  }
}

function getHelmMulti(weapon){
  if ( weapon['allow_headshots'] === "1" && use_headshot_calculations ) {
    return helm_multi;
  } else {
    return 1.0;
  }
}

//TODO: returns 0 for one hit kills. Which forces Math.min to 1 in the BTK function. not ideal.
function getBTKUsingUnshieldedDamage(damageAtDist, damage_unshielded_scale, target_shield, target_health) {
  let base_dmg = damageAtDist / damage_unshielded_scale;
  let shield_btk = target_shield / (base_dmg * APEX_MIN_DAMAGE_MULTIPLIER);
  let remaining_shield = (target_shield - (base_dmg * (Math.floor(shield_btk))));
  let transition_bullet = ((base_dmg - remaining_shield) * damage_unshielded_scale) + remaining_shield;
  target_health = target_health - transition_bullet;
  return (Math.ceil(target_health / (damageAtDist * APEX_MIN_DAMAGE_MULTIPLIER))) + Math.ceil(shield_btk);
}

// Disruptor rounds do extra damage to shields only. It is applied as additional damage to shields.
// Meaning when a shield's HP is less then base damage, no additional damage is applied.
// When a shield's HP is more then base but less then damage w/ multi. The resulting total damage is the shield's HP
function getBTKUsingShieldedDamage(damage, damage_shielded_scale, target_shield, target_health) {
  let modded_damage = damage * damage_shielded_scale;
  let shield_btk = target_shield / (modded_damage * APEX_MIN_DAMAGE_MULTIPLIER);
  let remaining_shield = (target_shield - (modded_damage * (Math.floor(shield_btk))));
  if (remaining_shield <= damage ) {
    target_health = target_health + remaining_shield;
    shield_btk = Math.floor(shield_btk);
  } else {
    shield_btk = Math.ceil(shield_btk);
  }
  return (Math.ceil(target_health / (damage * APEX_MIN_DAMAGE_MULTIPLIER))) + shield_btk;
}

/*
  Return weapon's damage at given point dist.
  damages and distances specify how much weapon
  does damage at those points, and everything
  else is linearly interpolated between.
*/
/**
 * @return {number}
 */
function APEX_InterpolateDamage(dist, damages, distances) {
  if (dist <= Math.min.apply(null, distances)) {
    return parseFloat(damages[0])
  } else if (dist >= Math.max.apply(null, distances)) {
    return parseFloat(damages[damages.length - 1])
  } else {
    let prevDist = undefined;
    let nextDist = undefined;
    let prevDmg = undefined;
    let nextDmg = undefined;
    for (let i = 0; i < distances.length; i++) {
      if (dist >= parseFloat(distances[i])) {
        prevDist = parseFloat(distances[i]);
        prevDmg = parseFloat(damages[i]);
        nextDist = parseFloat(distances[i + 1]);
        nextDmg = parseFloat( damages[i + 1])
      }
    }
    // Interpolate the two
    return prevDmg + ((dist - prevDist) / (nextDist - prevDist)) * (nextDmg - prevDmg)
  }
}

/*
  Return array of [distance, damage],
  where length of the array is based on constants
  defined above
*/
function APEXGetDamageOverDistance (weapon) {
  let hs_multi;
  hs_multi = getHSMulti(weapon);
  let hs_dist;
  let projectiles_per_shot = getProjectilePerShot(weapon);
  hs_dist = getMaxHSDist(weapon);
  let ls_multi = getLimbMulti(weapon);
  let fort_multi = getLegendDamageMulti();
  let helm_multi = getHelmMulti(weapon);
  let projectile_multi = getProjectileAmpedMulti();
  let unmodified_damage;
  let damage_out;
  const damages = weapon['damage_array'];
  const distances = weapon['damage_distance_array_m'];
  const damageOverDistance = [];

  // Loop over distance and store damages
  for (let dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {
    unmodified_damage = APEX_InterpolateDamage(dist, damages, distances);
    if ( dist > hs_dist) {
      hs_multi = 1.0;
      helm_multi = 1.0;
    }
    damage_out = ((((((unmodified_damage * projectile_multi) * fort_multi) * hs_multi) * helm_multi) * ls_multi) * projectiles_per_shot);
    damageOverDistance.push([dist, damage_out])
  }
  return damageOverDistance
}

/*
  Function to handle JSON data upon receiving it:
  Parse JSON data and preprocess it into different
  arrays.
*/
function APEXLoadSuccessCallback (data) {
  APEXWeaponData_orig = data;

  // Apex Weapons do not have a shared set of values for weapons.
  // All keys can not be found in one weapon. Go through them all then gather all the unique.
  // TODO: change how data is parsed before being used on the site and add missing/unused keys with default values
  //  to every weapon on the data parsing side. Then filter out unnecessary , unused, and troublesome keys on the data parsing side.

  const all_weapon_keys = [];
  for (let i = 0; i < APEXWeaponData_orig.length; i++) {
    let a = Object.keys(APEXWeaponData_orig[i]['WeaponData']);
    for(let j=0; j<a.length; j++) {
      all_weapon_keys.push(a[j]);
    }
    if (APEXWeaponData_orig[i] !== "WeaponViewkickPatterns"){
      APEXWeaponNameToData[APEXWeaponData_orig[i]['WeaponData']['printname']] = APEXWeaponData_orig[i];

    }
  }
  APEXWeaponKeys = Array.from(new Set(all_weapon_keys));

  // Sort keys for consistency between runs etc
  APEXWeaponKeys.sort();

  // Create APEXWeaponKeyToData
  let key;
  for (let key_i = 0; key_i < APEXWeaponKeys.length; key_i++) {
    key = APEXWeaponKeys[key_i];
    const dataRow = [];
    for (let weapon_i = 0; weapon_i < APEXWeaponData_orig.length; weapon_i++) {
      dataRow.push(APEXWeaponData_orig[weapon_i][key])
    }
    APEXWeaponKeyToData[key] = dataRow
  }
  active_weapon_attachments = {};
  // Create attachments array for each main weapon
  $.each(APEXWeaponData_orig, function(key, weapon) {
    if (weapon.WeaponData.weapon_type_flags === 'WPT_PRIMARY') {
      let i;
      let attachment_list = [];
      let optic_list = [];
      for (const [key] of Object.entries(weapon['WeaponData']['Mods'])) {
        if (customizationHopupStrings[key] !== undefined) {
          attachment_list.push(key);
        }
        if (customizationAttachmentStrings[key] !== undefined) {
          attachment_list.push(key);
        }
        if (customizationOpticStrings[key] !== undefined) {
          optic_list.push(key);
        }
      }
      weapon['WeaponData']["attachment_list"] = attachment_list;
      weapon['WeaponData']["optic_list"] = optic_list;
      const formatted_name = formatWeaponName(weapon['WeaponData']['printname']);
      weapon['WeaponData']['printname'] = formatted_name.replace(" -", "");
      if (apex_attachments[formatted_name] === undefined) {
        apex_attachments[formatted_name] = [];
      }
      for (i = 0; i < weapon['WeaponData']["attachment_list"].length; i++) {
        if (weapon['WeaponData']['Mods'][weapon['WeaponData']["attachment_list"][i]] !== undefined) {

          apex_attachments[formatted_name][i] = weapon['WeaponData']['Mods'][weapon['WeaponData']["attachment_list"][i]];
          apex_attachments[formatted_name][i].attachName = [weapon['WeaponData']["attachment_list"][i]];
        }
      }
      if (optic_customizations[formatted_name] === undefined) {
        optic_customizations[formatted_name] = [];
      }
      for (i = 0; i < weapon['WeaponData']["optic_list"].length; i++) {
        if (weapon['WeaponData']['Mods'][weapon['WeaponData']["optic_list"][i]] !== undefined) {

          optic_customizations[formatted_name][i] = weapon['WeaponData']['Mods'][weapon['WeaponData']["optic_list"][i]];
          optic_customizations[formatted_name][i].attachName = [weapon['WeaponData']["optic_list"][i]];
        }
      }
    }
  });
  APEXWeaponData =  jQuery.extend(true, [], APEXWeaponData_orig);
  APEXDataLoaded = true;

  // Proceed to appropriate page
  if (APEXSelectedPage === "APEX_CHART"){
    loadAPEXChartPage()
  } else if (APEXSelectedPage === "APEX_COMPARISON"){
    loadAPEXComparisonPage()
  } else if (APEXSelectedPage === "APEX_RECOIL_PATTERNS"){
    loadAPEXRecoilPatternPage()
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
  });
}

/*
  Load the APEX selector page that contains the buttons to allow
  the user to select which page to navigate to (chart, comp, etc...).
*/
function openAPEXSelectionPage () {
  loadPageWithHeader('./pages/apex/apex_header.html', 'Apex Legends', initializeAPEXSelection, APEX_VERSION_STRING)
}

function openAPEXSelectionPageFromQueryString(pageStr){
  apexPageToLoad = pageStr;
  loadPageWithHeader('./pages/apex/apex_header.html', 'Apex Legends', APEXLoadPageFromQueryString, APEX_VERSION_STRING)
}

/*
  Load the APEX main/entry/index page
*/
function openAPEXIndexPage () {
  $('.apex-main-content').load('./pages/apex/apex_index.html', APEXInitializeIndexPage)
}

/*
  Load the APEX General Info page
*/
function openAPEXGeneralInfoPage () {
  $('.apex-main-content').load('./pages/apex/apex_generalInfo.html')
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
    loadAPEXChartPage();
    loadApexStylesheet()
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
    APEXSelectedPage = "APEX_COMPARISON";
    APEXLoadWeaponData()
  } else {
    loadAPEXComparisonPage()
    loadApexCompareStylesheet()
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
    APEXSelectedPage = "APEX_RECOIL_PATTERNS";
    APEXLoadWeaponData()
  } else {
    loadAPEXRecoilPatternPage()
  }
}

/*
  Load the APEX Recoil Pattern data page
*/
function loadAPEXRecoilPatternPage () {
  $('.apex-main-content').load('./pages/apex/recoil_patterns/apex_recoilPatterns.html', apex_initializeRecoilPage)
}

/*
  Load the APEX Legends data page
*/
function loadAPEXLegendDataPage () {
  if (APEXDataLoaded === false) {
    APEXLoadWeaponData()
  }
  $('.apex-main-content').load('./pages/apex/apex_dataLegend.html', apex_initializeLegendsPage)
}

/*
  Main hub for opening different APEX pages based on their name.
  Handles coloring of the buttons etc
*/
function APEXOpenPageByName(pageName) {
  // Remove highlighting
  $('.sym-pageSelections > div').removeClass('selected-selector');
  $('.apex-main-content').html("<div class='sym-loading'>Loading...</div>");
  // Select right page according to pageName, highlight its
  // button and open the page
  if (pageName === 'Weapon Charts') {
    $('#apex-chartPageSelector').addClass('selected-selector');
    openAPEXChartPage();
    updateQueryString("apex", "charts")
  } else if (pageName === 'Weapon Comparison') {
    $('#apex-comparisonPageSelector').addClass('selected-selector');
    openAPEXComparisonPage();
    updateQueryString("apex", "comparison")
  } else if (pageName === 'General Information') {
    $('#apex-generalInfoPageSelector').addClass('selected-selector');
    openAPEXGeneralInfoPage();
    updateQueryString("apex", "general-info")
  } else if (pageName === 'Equipment Data') {
    $('#apex-equipmentPageSelector').addClass('selected-selector');
    openAPEXEquipmentPage();
    updateQueryString("apex", "equipment")
  } else if (pageName === 'Recoil Patterns') {
    $('#apex-recoilPatternPageSelector').addClass('selected-selector');
    openAPEXRecoilPatternPage();
    updateQueryString("apex", "recoil-patterns")
  } else if (pageName === 'Index') {
    $('#apex-mainPageSelector').addClass('selected-selector');
    openAPEXIndexPage();
    updateQueryString("apex", "index")
  } else if (pageName === 'Weapon Mechanics') {
    $('#apex-weaponPageSelector').addClass('selected-selector');
    openAPEXWeaponPage();
    updateQueryString("apex", "weapon-mechanics")
  } else if (pageName === 'Legend Data') {
    $('#apex-legendPageSelector').addClass('selected-selector');
    loadAPEXLegendDataPage();
    updateQueryString("apex", "legends")
  }
}

/*
  Add handlers for the click events for the apex selector page and open
  the entry page for APEX
*/
function initializeAPEXSelection () {
  APEXSetupPageHeader();
  openAPEXIndexPage()
}

/*
  Add handlers for the click events for the apex index page
*/
function APEXInitializeIndexPage(){
  $('.indexPageItem').click(function () {
    const itemClicked = $(this).find("h4").text();
    // TODO slippery slope: If title on the buttons changes,
    //                      it will break opening the page
    APEXOpenPageByName(itemClicked)
  })
}

function APEXSetupPageHeader(){
  loadApexStylesheet();
  loadApexCompareStylesheet();
  $('.sym-pageSelections > div').click(function () {
    const clicked = $(this).attr('id');
    let pageName;
    if (clicked === 'apex-chartPageSelector') {
      pageName = 'Weapon Charts'
    } else if (clicked === 'apex-comparisonPageSelector') {
      pageName = 'Weapon Comparison'
    } else if (clicked === 'apex-mainPageSelector') {
      pageName = 'Index'
    } else if (clicked === 'apex-generalInfoPageSelector') {
      pageName = 'General Information'
    } else if (clicked === 'apex-equipmentPageSelector') {
      pageName = 'Equipment Data'
    } else if (clicked === 'apex-weaponPageSelector') {
      pageName = 'Weapon Mechanics'
    } else if (clicked === 'apex-recoilPatternPageSelector') {
      pageName = 'Recoil Patterns'
    } else if (clicked === 'apex-legendPageSelector') {
      pageName = 'Legend Data'
    }
    APEXOpenPageByName(pageName)
  })
}

function APEXLoadPageFromQueryString(){
  APEXSetupPageHeader();
  APEXOpenPageByName(apexPageToLoad)
}

