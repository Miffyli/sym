// Path to datafile
// const APEX_DATA = './pages/apex/data/apex_B.json'
// const APEX_DATA = './pages/apex/data/apex_test.json';
const APEX_DATA = './pages/apex/data/apex_test_2.json';
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
var APEXWeaponData_orig = [];
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

const apex_weapon_name_dict = {
  "Alternator SMG": "WPN_ALTERNATOR_SMG",
  "B3": "WPN_WINGMAN",
  "Wingman": "WPN_WINGMAN",
  "Charge Rifle": "WPN_CHARGE_RIFLE",
  "Devotion LMG": "WPN_ESAW",
  "EVA-8 Auto": "WPN_SHOTGUN",
  "G7 Scout": "WPN_G2",
  "HAVOC Rifle": "WPN_ENERGY_AR",
  "Hemlok Burst AR": "WPN_HEMLOK",
  "Kraber .50-Cal Sniper": "WPN_SNIPER",
  "L-STAR EMG": "WPN_LSTAR",
  "Longbow DMR": "WPN_DMR",
  "M600 Spitfire": "WPN_LMG",
  "Mastiff Shotgun": "WPN_MASTIFF",
  "Mozambique Shotgun": "WPN_SHOTGUN_PISTOL",
  "P2020": "WPN_P2011",
  "Peacekeeper": "WPN_ENERGY_SHOTGUN",
  "Prowler Burst PDW": "WPN_PDW",
  "R-301 Carbine": "WPN_RSPN101",
  "R-99 SMG": "WPN_R97",
  "RE-45 Auto": "WPN_RE45_AUTOPISTOL",
  "Triple Take": "WPN_DOUBLETAKE",
  "VK-47 Flatline": "WPN_VINSON",
  "WPN_ALTERNATOR_SMG": "Alternator SMG",
  "WPN_WINGMAN": "Wingman",
  "WPN_CHARGE_RIFLE": "Charge Rifle",
  "WPN_ESAW": "Devotion LMG",
  "WPN_SHOTGUN": "EVA-8 Auto",
  "WPN_G2": "G7 Scout",
  "WPN_ENERGY_AR": "HAVOC Rifle",
  "WPN_HEMLOK": "Hemlok Burst AR",
  "WPN_SNIPER": "Kraber .50-Cal Sniper",
  "WPN_LSTAR": "L-STAR EMG",
  "WPN_DMR": "Longbow DMR",
  "WPN_LMG": "M600 Spitfire",
  "WPN_MASTIFF": "Mastiff Shotgun",
  "WPN_SHOTGUN_PISTOL": "Mozambique Shotgun",
  "WPN_P2011": "P2020",
  "WPN_ENERGY_SHOTGUN": "Peacekeeper",
  "WPN_PDW": "Prowler Burst PDW",
  "WPN_RSPN101": "R-301 Carbine",
  "WPN_R97": "R-99 SMG",
  "WPN_RE45_AUTOPISTOL": "RE-45 Auto",
  "WPN_DOUBLETAKE": "Triple Take",
  "WPN_VINSON": "VK-47 Flatline"};

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

function getHSMulti(weapon) {
  if ( weapon.allow_headshots === "1" && use_headshot_calculations ) {
    return weapon.damage_headshot_scale;
  } else {
    return 1.0;
  }
}

function getMaxHSDist(weapon) {
  let hs_dist_float = weapon.headshot_distance / 39.3701;
  if(hs_dist_float !== undefined) {
    return hs_dist_float
  } else {
    return 10000.0
  }
}

function getLimbMulti(weapon) {
  if ( use_ls_multi_calculations ) {
    return weapon.damage_leg_scale;
  } else {
    return 1.0;
  }
}

function getDamageScaleMulti(){
  if (use_fortified_calculations) {
    return 0.85
  } else if ( use_lowprofile_calculations) {
    return 1.05
  } else {
    return 1.0
  }
}

function getProjectileScaleMulti(){
    return 1.0

}

function getHelmMulti(){
  return 1.0
}

/*
  Return weapon's damage at given point dist.
  damages and distances specify how much weapon
  does damage at those points, and everything
  else is linearly interpolated between.
*/
function APEXInterpolateDamage2 (dist, damages, distances, hs_multi, hs_dist) {
  if (dist <= Math.min.apply(null, distances)) {
    return damages[0]
  } else if (dist >= Math.max.apply(null, distances)) {
    return damages[damages.length - 1]
  } else {
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
    var interpolated = prevDmg + ((dist - prevDist) / (nextDist - prevDist)) * (nextDmg - prevDmg);
    return interpolated
  }
}

function APEXInterpolateDamage (dist, damages, distances, hs_multi, hs_dist) {
  if (dist <= Math.min.apply(null, distances)) {
    if(dist < hs_dist) {
      return damages[0] * hs_multi
    } else {
      return damages[0]
    }
  } else if (dist >= Math.max.apply(null, distances)) {
    if(dist < hs_dist) {
      return damages[damages.length - 1] * hs_multi
    } else {
      return damages[damages.length - 1]
    }
  } else {
    var prevDist = undefined
    var nextDist = undefined
    var prevDmg = undefined
    var nextDmg = undefined
    var hs_prevDmg = undefined
    var hs_nextDmg = undefined
    for (var i = 0; i < distances.length; i++) {
      if (dist >= distances[i]) {
        prevDist = distances[i]

        hs_prevDmg = damages[i]
        if ( distances[i] < hs_dist) {
          hs_prevDmg = hs_prevDmg * hs_multi
        }
        prevDmg = hs_prevDmg

        nextDist = distances[i + 1]
        hs_nextDmg = damages[i + 1]
        if ( distances[i + 1] < hs_dist) {
          hs_nextDmg = hs_nextDmg * hs_multi
        }
        nextDmg = hs_nextDmg
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
  let hs_multi;
  hs_multi = getHSMulti(weapon);
  let hs_dist;
  hs_dist = getMaxHSDist(weapon);
  let ls_multi = getLimbMulti(weapon);
  let fort_mutli = getDamageScaleMulti();
  let helm_multi = getHelmMulti();
  let projectile_multi = getProjectileScaleMulti();
  let unmodified_damage;
  let damage_out;
  var damages = weapon['damage_array'];
  var distances = weapon['damage_distance_array_m'];
  var damageOverDistance = [];

  // Loop over distance and store damages
  for (var dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {
    unmodified_damage = APEXInterpolateDamage2(dist, damages, distances, hs_multi, hs_dist);
    if ( dist > hs_dist) {
      hs_multi = 1.0;
    }
    damage_out = (((((unmodified_damage * projectile_multi) * fort_mutli) * hs_multi) * helm_multi) * ls_multi);

    // console.log("DOST ", dist, " - ", hs_dist, "dmg, ", damage_out);
    damageOverDistance.push([dist, damage_out])
  }
  return damageOverDistance
}

/*
  Return array of [distance, bullets],
  where length of the array is based on constants
  defined above
*/
function APEXGetBTKUpperBoundOverDistance (weapon) {
  let hs_multi;
  hs_multi = getHSMulti(weapon);
  let hs_dist;
  hs_dist = getMaxHSDist(weapon);
  let ls_multi = getLimbMulti(weapon);
  let fort_mutli = getDamageScaleMulti();
  let helm_multi = getHelmMulti();
  let projectile_multi = getProjectileScaleMulti();
  let unmodified_damage;
  let damage_out;
  var damages = weapon['damage_array'];
  var distances = weapon['damage_distance_array_m'];
  var BTKUBOverDistance = [];

  // Loop over distance and store damages
  var damageAtDist = 0;
  for (var dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {
    unmodified_damage = APEXInterpolateDamage2(dist, damages, distances, hs_multi, hs_dist);
    if ( dist > hs_dist) {
      hs_multi = 1.0;
    }
    damage_out = (((((unmodified_damage * projectile_multi) * fort_mutli) * hs_multi) * helm_multi) * ls_multi);

    damageAtDist = damage_out; // damageAtDist = APEXInterpolateDamage2(dist, damages, distances, hs_multi, hs_dist);
    if (dist > hs_dist) {
      hs_multi = 1.0
    }
    BTKUBOverDistance.push([dist, Math.ceil(100 / (damageAtDist * APEX_MIN_DAMAGE_MULTIPLIER))])
  }
  return BTKUBOverDistance
}

function APEXGetWhiteBTKUpperBoundOverDistance (weapon) {
  let hs_multi;
  hs_multi = getHSMulti(weapon);
  let hs_dist;
  hs_dist = getMaxHSDist(weapon);
  let ls_multi = getLimbMulti(weapon);
  let fort_mutli = getDamageScaleMulti();
  let helm_multi = getHelmMulti();
  let projectile_multi = getProjectileScaleMulti();
  let unmodified_damage;
  let damage_out;


  var damages = weapon['damage_array'];
  var distances = weapon['damage_distance_array_m'];
  var WhiteBTKUBOverDistance = [];

  // Loop over distance and store damages
  var damageAtDist = 0;
  for (var dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {
    unmodified_damage = APEXInterpolateDamage2(dist, damages, distances, hs_multi, hs_dist);
    if ( dist > hs_dist) {
      hs_multi = 1.0;
    }
    damage_out = (((((unmodified_damage * projectile_multi) * fort_mutli) * hs_multi) * helm_multi) * ls_multi);

    damageAtDist = damage_out; // damageAtDist = APEXInterpolateDamage2(dist, damages, distances, hs_multi, hs_dist);
    if (dist > hs_dist) {
      hs_multi = 1.0
    }
    WhiteBTKUBOverDistance.push([dist, Math.ceil(150 / (damageAtDist * APEX_MIN_DAMAGE_MULTIPLIER))])
  }
  return WhiteBTKUBOverDistance
}

function APEXGetBlueBTKUpperBoundOverDistance (weapon) {
  let hs_multi;
  hs_multi = getHSMulti(weapon);
  let hs_dist;
  hs_dist = getMaxHSDist(weapon);
  let ls_multi = getLimbMulti(weapon);
  let fort_mutli = getDamageScaleMulti();
  let helm_multi = getHelmMulti();
  let projectile_multi = getProjectileScaleMulti();
  let unmodified_damage;
  let damage_out;
  var damages = weapon['damage_array'];
  var distances = weapon['damage_distance_array_m'];
  var BlueBTKUBOverDistance = [];

  // Loop over distance and store damages
  var damageAtDist = 0;
  for (var dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {
    unmodified_damage = APEXInterpolateDamage2(dist, damages, distances, hs_multi, hs_dist);
    if ( dist > hs_dist) {
      hs_multi = 1.0;
    }
    damage_out = (((((unmodified_damage * projectile_multi) * fort_mutli) * hs_multi) * helm_multi) * ls_multi);

    damageAtDist = damage_out; // damageAtDist = APEXInterpolateDamage2(dist, damages, distances, hs_multi, hs_dist);
    if (dist > hs_dist) {
      hs_multi = 1.0
    }
    BlueBTKUBOverDistance.push([dist, Math.ceil(175 / (damageAtDist * APEX_MIN_DAMAGE_MULTIPLIER))])
  }
  return BlueBTKUBOverDistance
}

function APEXGetPurpleBTKUpperBoundOverDistance (weapon) {
  let hs_multi;
  hs_multi = getHSMulti(weapon);
  let hs_dist;
  hs_dist = getMaxHSDist(weapon);
  let ls_multi = getLimbMulti(weapon);
  let fort_mutli = getDamageScaleMulti();
  let helm_multi = getHelmMulti();
  let projectile_multi = getProjectileScaleMulti();
  let unmodified_damage;
  let damage_out;
  var damages = weapon['damage_array'];
  var distances = weapon['damage_distance_array_m'];
  var PurpleBTKUBOverDistance = [];

  // Loop over distance and store damages
  var damageAtDist = 0;
  for (var dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {
    unmodified_damage = APEXInterpolateDamage2(dist, damages, distances, hs_multi, hs_dist);
    if ( dist > hs_dist) {
      hs_multi = 1.0;
    }
    damage_out = (((((unmodified_damage * projectile_multi) * fort_mutli) * hs_multi) * helm_multi) * ls_multi);

    damageAtDist = damage_out; // damageAtDist = APEXInterpolateDamage2(dist, damages, distances, hs_multi, hs_dist);
    if (dist > hs_dist) {
      hs_multi = 1.0
    }
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
  let hs_multi;
  hs_multi = getHSMulti(weapon);
  let hs_dist;
  hs_dist = getMaxHSDist(weapon);
  let ls_multi = getLimbMulti(weapon);
  let fort_mutli = getDamageScaleMulti();
  let helm_multi = getHelmMulti();
  let projectile_multi = getProjectileScaleMulti();
  let unmodified_damage;
  let damage_out;
  var damages = weapon['damage_array'];
  var distances = weapon['damage_distance_array_m'];
  var bulletVelocity = weapon['projectile_launch_speed'] / 39.3701;
  var bulletDrag = 0.0; // weapon['projectile_drag_coefficient'];
  if(weapon['effective_fire_rate'] !== undefined){
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
    unmodified_damage = APEXInterpolateDamage2(dist, damages, distances, hs_multi, hs_dist);
    if ( dist > hs_dist) {
      hs_multi = 1.0;
    }
    damage_out = (((((unmodified_damage * projectile_multi) * fort_mutli) * hs_multi) * helm_multi) * ls_multi);

    damageAtDist = damage_out; // damageAtDist = APEXInterpolateDamage2(dist, damages, distances, hs_multi, hs_dist);
    // Floor because we do not need the last bullet
    if (dist > hs_dist) {
      hs_multi = 1.0
    }
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
  let hs_multi;
  hs_multi = getHSMulti(weapon);
  let hs_dist;
  hs_dist = getMaxHSDist(weapon);
  let ls_multi = getLimbMulti(weapon);
  let fort_mutli = getDamageScaleMulti();
  let helm_multi = getHelmMulti();
  let projectile_multi = getProjectileScaleMulti();
  let unmodified_damage;
  let damage_out;
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
    unmodified_damage = APEXInterpolateDamage2(dist, damages, distances, hs_multi, hs_dist);
    if ( dist > hs_dist) {
      hs_multi = 1.0;
    }
    damage_out = (((((unmodified_damage * projectile_multi) * fort_mutli) * hs_multi) * helm_multi) * ls_multi);

    damageAtDist = damage_out; // damageAtDist = APEXInterpolateDamage2(dist, damages, distances, hs_multi, hs_dist);
    if (dist > hs_dist) {
      hs_multi = 1.0
    }
    // Floor because we do not need the last bullet
    bulletsToKill = Math.floor(150 / (damageAtDist * APEX_MIN_DAMAGE_MULTIPLIER));

    msToTarget = bulletFlightSeconds * 1000;
    // Update bullet velocity and time we are flying
    bulletFlightSeconds += APEX_DAMAGE_RANGE_STEP / bulletVelocity;
    // Update according to drag
    bulletVelocity -= (Math.pow(bulletVelocity, 2) * bulletDrag) * (APEX_DAMAGE_RANGE_STEP / bulletVelocity);

    // The only time from bullet flight comes from the last bullet that lands on the enemy,
    // hence we only add msToTarget once
    // console.log("X ", hs_multi, "hs dist: ", hs_dist, "dist: ", dist, damageAtDist);
    WhiteTTKUBOverDistance.push([dist, bulletsToKill * msPerShot + msToTarget])
  }
  return WhiteTTKUBOverDistance
}

function APEXGetBlueTTKUpperBoundOverDistance (weapon) {
  let hs_multi;
  hs_multi = getHSMulti(weapon);
  let hs_dist;
  hs_dist = getMaxHSDist(weapon);
  let ls_multi = getLimbMulti(weapon);
  let fort_mutli = getDamageScaleMulti();
  let helm_multi = getHelmMulti();
  let projectile_multi = getProjectileScaleMulti();
  let unmodified_damage;
  let damage_out;
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
    unmodified_damage = APEXInterpolateDamage2(dist, damages, distances, hs_multi, hs_dist);
    if ( dist > hs_dist) {
      hs_multi = 1.0;
    }
    damage_out = (((((unmodified_damage * projectile_multi) * fort_mutli) * hs_multi) * helm_multi) * ls_multi);

    damageAtDist = damage_out; // damageAtDist = APEXInterpolateDamage2(dist, damages, distances, hs_multi, hs_dist);
    // Floor because we do not need the last bullet
    if (dist > hs_dist) {
      hs_multi = 1.0
    }
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
  let hs_multi;
  hs_multi = getHSMulti(weapon);
  let hs_dist;
  hs_dist = getMaxHSDist(weapon);
  let ls_multi = getLimbMulti(weapon);
  let fort_mutli = getDamageScaleMulti();
  let helm_multi = getHelmMulti();
  let projectile_multi = getProjectileScaleMulti();
  let unmodified_damage;
  let damage_out;
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
    unmodified_damage = APEXInterpolateDamage2(dist, damages, distances, hs_multi, hs_dist);
    if ( dist > hs_dist) {
      hs_multi = 1.0;
    }
    damage_out = (((((unmodified_damage * projectile_multi) * fort_mutli) * hs_multi) * helm_multi) * ls_multi);

    damageAtDist = damage_out; // damageAtDist = APEXInterpolateDamage2(dist, damages, distances, hs_multi, hs_dist);
    // Floor because we do not need the last bullet
    if (dist > hs_dist) {
      hs_multi = 1.0
    }
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
  APEXWeaponData_orig = data;
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
  Load the APEX Recoil Pattern data page
*/
function loadAPEXRecoilPatternPage () {
  $('.apex-main-content').load('./pages/apex/recoilpatterns/apex_recoilPatterns.html', apex_initializeRecoilPage)
}

/*
  Load the APEX Legends data page
*/
function loadAPEXLegendDataPage () {
  $('.apex-main-content').load('./pages/apex/apex_dataLegend.html')
}

/*
  Main hub for opening different APEX pages based on their name.
  Handles coloring of the buttons etc
*/
function APEXOpenPageByName(pageName) {
  // Remove highlighting
  $('.sym-pageSelections > div').removeClass('selected-selector');
  $('.apex-main-content').html("<div class='sym-loading'>Loading...</div>")
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
  } else if (pageName === 'Legend Data') {
    $('#apex-legendPageSelector').addClass('selected-selector');
    loadAPEXLegendDataPage()
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
    } else if (clicked == 'apex-legendPageSelector') {
      pageName = 'Legend Data'
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
