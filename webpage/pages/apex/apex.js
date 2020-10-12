// Path to datafile
const APEX_DATA = './pages/apex/data/apex_data_r5-61_J150_CL625858.json';
// const APEX_DATA = './pages/apex/data/apex_data_N1791_CL475134.json';

// Manual dates when the data or pages have been modified.
// In format "[day] [month three letters] [year four digits]"
// e.g. 2nd Jan 2019
const APEX_DATA_DATE = '06th Oct 2020 (apex_data_r5-61_J150_CL625858)'
const APEX_PAGE_DATE = '06th Oct 2020'

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
  "Volt SMG": "WPN_VOLT_SMG",
  "Emplaced Minigun": "WPN_MOUNTED_TURRET_WEAPON",
  "Sentinel": "WPN_SENTINEL",
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
  "WPN_VINSON": "VK-47 Flatline",
  "WPN_VOLT_SMG": "Volt SMG",
  "WPN_MOUNTED_TURRET_WEAPON": "Emplaced Minigun",
  "WPN_SENTINEL": "Sentinel"};

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

// Note: Currently amped multis are the same across all damage dist ranges.
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


// function getTTKUsingUnshieldedDamage(damageAtDist, damage_unshielded_scale, target_shield, target_health) {
//   let base_dmg = damageAtDist / damage_unshielded_scale;
//   let shield_btk = target_shield / (base_dmg * APEX_MIN_DAMAGE_MULTIPLIER);
//   let remaining_shield = (target_shield - (base_dmg * (Math.floor(shield_btk))));
//   let transition_bullet = ((base_dmg - remaining_shield) * damage_unshielded_scale) + remaining_shield;
//   target_health = target_health - transition_bullet;
//   return (Math.ceil(target_health / (damageAtDist * APEX_MIN_DAMAGE_MULTIPLIER))) + Math.ceil(shield_btk);
// }


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
  Return array of [distance, bullets],
  where length of the array is based on constants
  defined above
*/
function APEXGetBTKUpperBoundOverDistance (weapon) {
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
  const BTKUBOverDistance = [];
  // let damage_unshielded_scale = getUnShieldedDamageScale(weapon);

  // Loop over distance and store damages
  let damageAtDist = 0;
  for (let dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {
    unmodified_damage = APEX_InterpolateDamage(dist, damages, distances);
    if ( dist > hs_dist) {
      hs_multi = 1.0;
      helm_multi = 1.0;
    }
    damage_out = ((((((unmodified_damage * projectile_multi) * fort_multi) * hs_multi) * helm_multi) * ls_multi) * projectiles_per_shot);

    damageAtDist = damage_out; // damageAtDist = APEX_InterpolateDamage(dist, damages, distances);
    if (dist > hs_dist) {
      hs_multi = 1.0;
      helm_multi = 1.0;
    }
    BTKUBOverDistance.push([dist, Math.ceil(100 / (damageAtDist * APEX_MIN_DAMAGE_MULTIPLIER))])
  }
  return BTKUBOverDistance
}

function APEXGetWhiteBTKUpperBoundOverDistance (weapon) {
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
  let damage_unshielded_scale = getUnShieldedDamageScale(weapon);
  let target_shield = 50;
  let target_health = 100;
  let combined_btk = 0;


  const damages = weapon['damage_array'];
  const distances = weapon['damage_distance_array_m'];
  const WhiteBTKUBOverDistance = [];

  // Loop over distance and store damages
  let damageAtDist = 0;
  for (let dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {
    unmodified_damage = APEX_InterpolateDamage(dist, damages, distances);
    if ( dist > hs_dist) {
      hs_multi = 1.0;
      helm_multi = 1.0;
    }
    damage_out = ((((((unmodified_damage * projectile_multi) * fort_multi) * hs_multi) * helm_multi) * ls_multi) * projectiles_per_shot);

    damageAtDist = damage_out;
    if (dist > hs_dist) {
      hs_multi = 1.0;
      helm_multi = 1.0;
    }
    if (damage_unshielded_scale > 1){
      combined_btk = getBTKUsingUnshieldedDamage(damageAtDist, damage_unshielded_scale, target_shield, target_health);
    } else {
      combined_btk = Math.ceil(150 / (damageAtDist * APEX_MIN_DAMAGE_MULTIPLIER))
    }
    WhiteBTKUBOverDistance.push([dist, combined_btk]);
    target_shield = 50;
    target_health = 100;
  }
  return WhiteBTKUBOverDistance
}

function APEXGetBlueBTKUpperBoundOverDistance (weapon) {
  let hs_multi;
  hs_multi = getHSMulti(weapon);
  let hs_dist;
  hs_dist = getMaxHSDist(weapon);
  let projectiles_per_shot = getProjectilePerShot(weapon);
  let ls_multi = getLimbMulti(weapon);
  let fort_multi = getLegendDamageMulti();
  let helm_multi = getHelmMulti(weapon);
  let projectile_multi = getProjectileAmpedMulti();
  let unmodified_damage;
  let damage_out;
  const damages = weapon['damage_array'];
  const distances = weapon['damage_distance_array_m'];
  const BlueBTKUBOverDistance = [];
  let damage_unshielded_scale = getUnShieldedDamageScale(weapon);
  let target_shield = 75;
  let target_health = 100;
  let combined_btk = 0;

  // Loop over distance and store damages
  let damageAtDist = 0;
  for (let dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {
    unmodified_damage = APEX_InterpolateDamage(dist, damages, distances);
    if ( dist > hs_dist) {
      hs_multi = 1.0;
      helm_multi = 1.0;
    }
    damage_out = ((((((unmodified_damage * projectile_multi) * fort_multi) * hs_multi) * helm_multi) * ls_multi) * projectiles_per_shot);

    damageAtDist = damage_out;
    if (dist > hs_dist) {
      hs_multi = 1.0;
      helm_multi = 1.0;
    }
    if (damage_unshielded_scale > 1){
      combined_btk = getBTKUsingUnshieldedDamage(damageAtDist, damage_unshielded_scale, target_shield, target_health);
    } else {
      combined_btk = Math.ceil(175 / (damageAtDist * APEX_MIN_DAMAGE_MULTIPLIER))
    }
    BlueBTKUBOverDistance.push([dist, combined_btk]);
    target_shield = 75;
    target_health = 100;
  }
  return BlueBTKUBOverDistance
}

function APEXGetPurpleBTKUpperBoundOverDistance (weapon) {
  let damage_unshielded_scale = getUnShieldedDamageScale(weapon);
  let hs_multi;
  hs_multi = getHSMulti(weapon);
  let hs_dist;
  hs_dist = getMaxHSDist(weapon);
  let projectiles_per_shot = getProjectilePerShot(weapon);
  let ls_multi = getLimbMulti(weapon);
  let fort_multi = getLegendDamageMulti();
  let helm_multi = getHelmMulti(weapon);
  let projectile_multi = getProjectileAmpedMulti();
  let unmodified_damage;
  let damage_out;
  const damages = weapon['damage_array'];
  const distances = weapon['damage_distance_array_m'];
  const PurpleBTKUBOverDistance = [];
  let target_shield = 100;
  let target_health = 100;
  let combined_btk = 0;

  // Loop over distance and store damages
  let damageAtDist = 0;

  for (let dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {
    // if   // let damage_unshielded_scale = getUnShieldedDamageScale(weapon);
    unmodified_damage = APEX_InterpolateDamage(dist, damages, distances);
    if ( dist > hs_dist) {
      hs_multi = 1.0;
      helm_multi = 1.0;
    }
    damage_out = ((((((unmodified_damage * projectile_multi) * fort_multi) * hs_multi) * helm_multi) * ls_multi) * projectiles_per_shot);

    damageAtDist = damage_out;
    if (dist > hs_dist) {
      hs_multi = 1.0;
      helm_multi = 1.0;
    }

    if (damage_unshielded_scale > 1){
      combined_btk = getBTKUsingUnshieldedDamage(damageAtDist, damage_unshielded_scale, target_shield, target_health);
    } else {
      combined_btk = Math.ceil(200 / (damageAtDist * APEX_MIN_DAMAGE_MULTIPLIER))
    }
    PurpleBTKUBOverDistance.push([dist, combined_btk]);
    target_shield = 100;
    target_health = 100;
  }
  return PurpleBTKUBOverDistance
}

function APEXGetRedBTKUpperBoundOverDistance (weapon) {
  let damage_unshielded_scale = getUnShieldedDamageScale(weapon);
  let hs_multi;
  hs_multi = getHSMulti(weapon);
  let hs_dist;
  hs_dist = getMaxHSDist(weapon);
  let projectiles_per_shot = getProjectilePerShot(weapon);
  let ls_multi = getLimbMulti(weapon);
  let fort_multi = getLegendDamageMulti();
  let helm_multi = getHelmMulti(weapon);
  let projectile_multi = getProjectileAmpedMulti();
  let unmodified_damage;
  let damage_out;
  const damages = weapon['damage_array'];
  const distances = weapon['damage_distance_array_m'];
  const RedBTKUBOverDistance = [];
  let target_shield = 125;
  let target_health = 100;
  let combined_btk = 0;

  // Loop over distance and store damages
  let damageAtDist = 0;

  for (let dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {
    // if   // let damage_unshielded_scale = getUnShieldedDamageScale(weapon);
    unmodified_damage = APEX_InterpolateDamage(dist, damages, distances);
    if ( dist > hs_dist) {
      hs_multi = 1.0;
      helm_multi = 1.0;
    }
    damage_out = ((((((unmodified_damage * projectile_multi) * fort_multi) * hs_multi) * helm_multi) * ls_multi) * projectiles_per_shot);

    damageAtDist = damage_out;
    if (dist > hs_dist) {
      hs_multi = 1.0;
      helm_multi = 1.0;
    }

    if (damage_unshielded_scale > 1){
      combined_btk = getBTKUsingUnshieldedDamage(damageAtDist, damage_unshielded_scale, target_shield, target_health);
    } else {
      combined_btk = Math.ceil(225 / (damageAtDist * APEX_MIN_DAMAGE_MULTIPLIER))
    }
    RedBTKUBOverDistance.push([dist, combined_btk]);
    target_shield = 125;
    target_health = 100;
  }
  return RedBTKUBOverDistance
}


function testthing(weapon, dist, bulletsToKill, msToTarget) {

  // let TTKAtDistance = [];

  let fire_rate_speedup_array = [];
  let fire_rate_array = [];
  let nextPrimaryAttackTime = 0.0;
  let lastPrimaryAttack = 0.0;

  //TODO: check/setup Charge Rifle to charge values  m_nextPrimaryAttackTime
  // if (weapon['charge_attack_min_charge_required'] && weapon['charge_time'] > 0.01)// Havok
  // if (use_charge_spinup_time_calculations && weapon['fire_rate_max_time_speedup'] !== undefined) {
  //
  // let nextPrimaryAttackTime = 0.0;
  // let lastPrimaryAttack = 0.0;

  fire_rate_array = [weapon['fire_rate'], weapon['fire_rate_max']];
  fire_rate_speedup_array = [0.0, weapon['fire_rate_max_time_speedup']];

  for (let cur_bullet = 0; cur_bullet <= bulletsToKill; cur_bullet += 1) {
    lastPrimaryAttack += nextPrimaryAttackTime;
    // let nextPrimaryAttackTime = 1 / (APEX_InterpolateDamage(old_time_test, fire_rate_array, fire_rate_speedup_array));
    let nextPrimaryAttackTime_tmp = APEX_InterpolateDamage(lastPrimaryAttack, fire_rate_array, fire_rate_speedup_array);
    nextPrimaryAttackTime = 1 / nextPrimaryAttackTime_tmp;
    if (dist <= 5) {
      console.log("tesxxttxxxching dist %d cur_bullet: %d of(BTK): %d, lastPrimaryAttack: %f, nextPrimaryAttackTime: %f (%f)  ", dist, cur_bullet, bulletsToKill, lastPrimaryAttack);
    }
    // }

    // The only time from bullet flight comes from the last bullet that lands on the enemy,
    // hence we only add msToTarget once
    // TTKAtDistance.push([dist, (lastPrimaryAttack * 1000) + msToTarget])
  }
  // return TTKAtDistance;
  return (lastPrimaryAttack * 1000) + msToTarget;
}

/*
  Return array of [distance, milliseconds],
  where length of the array is based on constants
  defined above
*/
function APEXGetTTKUpperBoundOverDistance (weapon) {
  let msPerShot;
  let hs_multi;
  // let damage_unshielded_scale = getUnShieldedDamageScale(weapon);
  let projectiles_per_shot = getProjectilePerShot(weapon);
  hs_multi = getHSMulti(weapon);
  let hs_dist;
  hs_dist = getMaxHSDist(weapon);
  let ls_multi = getLimbMulti(weapon);
  let fort_multi = getLegendDamageMulti();
  let helm_multi = getHelmMulti(weapon);
  let projectile_multi = getProjectileAmpedMulti();
  let unmodified_damage;
  let damage_out;
  const damages = weapon['damage_array'];
  const distances = weapon['damage_distance_array_m'];
  let bulletVelocity = weapon['projectile_launch_speed_m'];
  const bulletDrag = 0.0; // weapon['projectile_drag_coefficient'];
  if(weapon['effective_fire_rate'] !== undefined){
    msPerShot = 60000 / (weapon['effective_fire_rate']);
  } else {
    msPerShot = 1000 / (weapon['fire_rate']);
  }
  const TTKUBOverDistance = [];



  // Loop over distance and store damages
  let damageAtDist = 0;
  let msToTarget = 0;
  let bulletsToKill = 0;
  // Used to track how long bullet has been flying
  let bulletFlightSeconds = 0.0;

  //
  let ttk_val = 0.0;
  //
  let fire_rate_speedup_array = [];
  let fire_rate_array = [];
  let m_nextPrimaryAttackTime = 0.0;
  let m_lastPrimaryAttack = 0.0;

  for (let dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {
    unmodified_damage = APEX_InterpolateDamage(dist, damages, distances);
    if ( dist > hs_dist) {
      hs_multi = 1.0;
      helm_multi = 1.0;
    }
    damage_out = ((((((unmodified_damage * projectile_multi) * fort_multi) * hs_multi) * helm_multi) * ls_multi) * projectiles_per_shot);

    damageAtDist = damage_out; // damageAtDist = APEX_InterpolateDamage(dist, damages, distances);
    // Floor because we do not need the last bullet
    if (dist > hs_dist) {
      hs_multi = 1.0;
      helm_multi = 1.0;
    }
    bulletsToKill = Math.floor(100 / (damageAtDist * APEX_MIN_DAMAGE_MULTIPLIER));

    msToTarget = bulletFlightSeconds * 1000;
    // Update bullet velocity and time we are flying
    bulletFlightSeconds += APEX_DAMAGE_RANGE_STEP / bulletVelocity;
    // Update according to drag
    bulletVelocity -= (Math.pow(bulletVelocity, 2) * bulletDrag) * (APEX_DAMAGE_RANGE_STEP / bulletVelocity);


    //TODO: check/setup Charge Rifle to charge values  m_nextPrimaryAttackTime
    // if (weapon['charge_attack_min_charge_required'] && weapon['charge_time'] > 0.01)// Havok
    if (use_charge_spinup_time_calculations && weapon['fire_rate_max_time_speedup'] !== undefined){
      // ttk_val = testthing(weapon, dist, bulletsToKill, msToTarget);
      // TTKUBOverDistance.push(testthing(weapon, dist, bulletsToKill, msToTarget))
      m_nextPrimaryAttackTime = 0.0;
      m_lastPrimaryAttack = 0.0;

      fire_rate_array = [weapon['fire_rate'], weapon['fire_rate_max']];
      fire_rate_speedup_array = [0.0, weapon['fire_rate_max_time_speedup']];

      for (let cur_bullet = 0; cur_bullet <= bulletsToKill; cur_bullet += 1) {
        m_lastPrimaryAttack += m_nextPrimaryAttackTime;
        m_nextPrimaryAttackTime = 1/ (APEX_InterpolateDamage(m_lastPrimaryAttack, fire_rate_array, fire_rate_speedup_array));
        if (dist <= 0) {
          console.log("APEXGetTTK dist %d cur_bullet: %d of(BTK): %d, m_lastPrimaryAttack: %f, m_nextPrimaryAttackTime: %f  ", dist, cur_bullet, bulletsToKill, m_lastPrimaryAttack, m_nextPrimaryAttackTime);
        }
      }

      // The only time from bullet flight comes from the last bullet that lands on the enemy,
      // hence we only add msToTarget once
      TTKUBOverDistance.push([dist, (m_lastPrimaryAttack * 1000) + msToTarget])

    } else {

      // The only time from bullet flight comes from the last bullet that lands on the enemy,
      // hence we only add msToTarget once
      // ttk_val = bulletsToKill * msPerShot + msToTarget;
      TTKUBOverDistance.push([dist, bulletsToKill * msPerShot + msToTarget])
    }
    // TTKUBOverDistance.push([dist, ttk_val])

  }
  return TTKUBOverDistance
}

function APEXGetWhiteTTKUpperBoundOverDistance (weapon) {
  let msPerShot;
  let hs_multi;
  let projectiles_per_shot = getProjectilePerShot(weapon);
  hs_multi = getHSMulti(weapon);
  let hs_dist;
  hs_dist = getMaxHSDist(weapon);
  let ls_multi = getLimbMulti(weapon);
  let fort_multi = getLegendDamageMulti();
  let helm_multi = getHelmMulti(weapon);
  let projectile_multi = getProjectileAmpedMulti();
  let unmodified_damage;
  let damage_out;
  const damages = weapon['damage_array'];
  const distances = weapon['damage_distance_array_m'];
  let bulletVelocity = weapon['projectile_launch_speed_m'];
  const bulletDrag = 0.0; // weapon['projectile_drag_coefficient'];
  if(weapon['effective_fire_rate'] !== undefined){
    msPerShot = 60000 / (weapon['effective_fire_rate']);
  } else {
    msPerShot = 1000 / (weapon['fire_rate']);
  }
  const WhiteTTKUBOverDistance = [];

  // Loop over distance and store damages
  let damageAtDist = 0;
  let msToTarget = 0;
  let bulletsToKill = 0;
  // Used to track how long bullet has been flying
  let bulletFlightSeconds = 0.0;
  let damage_unshielded_scale = getUnShieldedDamageScale(weapon);
  let target_shield = 50;
  let target_health = 100;
  let combined_btk = 0;
  for (let dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {
    unmodified_damage = APEX_InterpolateDamage(dist, damages, distances);
    if ( dist > hs_dist) {
      hs_multi = 1.0;
      helm_multi = 1.0;
    }
    damage_out = ((((((unmodified_damage * projectile_multi) * fort_multi) * hs_multi) * helm_multi) * ls_multi) * projectiles_per_shot);

    damageAtDist = damage_out;
    if (dist > hs_dist) {
      hs_multi = 1.0;
      helm_multi = 1.0;
    }
    // Floor because we do not need the last bullet
    if (damage_unshielded_scale > 1){
      combined_btk = getBTKUsingUnshieldedDamage(damageAtDist, damage_unshielded_scale, target_shield, target_health);
    } else {
      combined_btk = Math.ceil(150 / (damageAtDist * APEX_MIN_DAMAGE_MULTIPLIER))
    }

    target_shield = 50;
    target_health = 100;
    bulletsToKill = combined_btk;

    let fire_rate_speedup_array = [];
    let fire_rate_array = [];
    let m_nextPrimaryAttackTime = 0.0;
    let m_lastPrimaryAttack = 0.0;

    msToTarget = bulletFlightSeconds * 1000;
    // Update bullet velocity and time we are flying
    bulletFlightSeconds += APEX_DAMAGE_RANGE_STEP / bulletVelocity;
    // Update according to drag
    bulletVelocity -= (Math.pow(bulletVelocity, 2) * bulletDrag) * (APEX_DAMAGE_RANGE_STEP / bulletVelocity);

    //
    let ttk_val = 0.0;

    //TODO: check/setup Charge Rifle to charge values  m_nextPrimaryAttackTime
    // if (weapon['charge_attack_min_charge_required'] && weapon['charge_time'] > 0.01)// Havok
    if (use_charge_spinup_time_calculations && weapon['fire_rate_max_time_speedup'] !== undefined){
      m_nextPrimaryAttackTime = 0.0;
      m_lastPrimaryAttack = 0.0;

      fire_rate_array = [weapon['fire_rate'], weapon['fire_rate_max']];
      fire_rate_speedup_array = [0.0, weapon['fire_rate_max_time_speedup']];

      for (let cur_bullet = 0; cur_bullet <= bulletsToKill; cur_bullet += 1) {
        m_lastPrimaryAttack += m_nextPrimaryAttackTime;
        // let m_nextPrimaryAttackTime = 1 / (APEX_InterpolateDamage(old_time_test, fire_rate_array, fire_rate_speedup_array));
        // interpolate attack time / fire rate based on the previous bullets and time between start attack time(0) and max_time_speedup
        let m_nextPrimaryAttackTime_tmp = APEX_InterpolateDamage(m_lastPrimaryAttack, fire_rate_array, fire_rate_speedup_array);
        m_nextPrimaryAttackTime = 1 / m_nextPrimaryAttackTime_tmp;
        if (dist <= 0) {
          console.log("APEXGetWhite dist %d cur_bullet: %d of(BTK): %d, m_lastPrimaryAttack: %f, m_nextPrimaryAttackTime: %f (%f)  ", dist, cur_bullet, bulletsToKill, m_lastPrimaryAttack, m_nextPrimaryAttackTime, m_nextPrimaryAttackTime_tmp);
        }
      }

      ttk_val = (m_lastPrimaryAttack * 1000) + msToTarget;
    } else {
      ttk_val = bulletsToKill * msPerShot + msToTarget;
    }
    // // The only time from bullet flight comes from the last bullet that lands on the enemy,
    // // hence we only add msToTarget once
    // WhiteTTKUBOverDistance.push([dist, bulletsToKill * msPerShot + msToTarget])
    WhiteTTKUBOverDistance.push([dist, ttk_val])
  }
  return WhiteTTKUBOverDistance
}

function APEXGetBlueTTKUpperBoundOverDistance (weapon) {
  let msPerShot;
  let hs_multi;
  hs_multi = getHSMulti(weapon);
  let hs_dist;
  hs_dist = getMaxHSDist(weapon);
  let ls_multi = getLimbMulti(weapon);
  let fort_multi = getLegendDamageMulti();
  let helm_multi = getHelmMulti(weapon);
  let projectile_multi = getProjectileAmpedMulti();
  let unmodified_damage;
  let damage_out;
  let projectiles_per_shot = getProjectilePerShot(weapon);
  const damages = weapon['damage_array'];
  const distances = weapon['damage_distance_array_m'];
  let bulletVelocity = weapon['projectile_launch_speed_m'];
  const bulletDrag = 0.0; // weapon['projectile_drag_coefficient'];
  if(weapon['effective_fire_rate'] !== undefined){
    msPerShot = 60000 / (weapon['effective_fire_rate']);
  } else {
    msPerShot = 1000 / (weapon['fire_rate']);
  }
  const BlueTTKUBOverDistance = [];

  // Loop over distance and store damages
  let damageAtDist = 0;
  let msToTarget = 0;
  let bulletsToKill = 0;
  // Used to track how long bullet has been flying
  let bulletFlightSeconds = 0.0;
  let damage_unshielded_scale = getUnShieldedDamageScale(weapon);
  let target_shield = 75;
  let target_health = 100;
  let combined_btk = 0;
  for (let dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {
    unmodified_damage = APEX_InterpolateDamage(dist, damages, distances);
    if ( dist > hs_dist) {
      hs_multi = 1.0;
      helm_multi = 1.0;
    }
    damage_out = ((((((unmodified_damage * projectile_multi) * fort_multi) * hs_multi) * helm_multi) * ls_multi) * projectiles_per_shot);

    damageAtDist = damage_out;
    // Floor because we do not need the last bullet
    if (dist > hs_dist) {
      hs_multi = 1.0;
      helm_multi = 1.0;
    }
    if (damage_unshielded_scale > 1){
      combined_btk = getBTKUsingUnshieldedDamage(damageAtDist, damage_unshielded_scale, target_shield, target_health);
    } else {
      combined_btk = Math.ceil(175 / (damageAtDist * APEX_MIN_DAMAGE_MULTIPLIER))
    }

    target_shield = 75;
    target_health = 100;
    bulletsToKill = combined_btk;

    msToTarget = bulletFlightSeconds * 1000;
    // Update bullet velocity and time we are flying
    bulletFlightSeconds += APEX_DAMAGE_RANGE_STEP / bulletVelocity;
    // Update according to drag
    bulletVelocity -= (Math.pow(bulletVelocity, 2) * bulletDrag) * (APEX_DAMAGE_RANGE_STEP / bulletVelocity);

    // The only time from bullet flight comes from the last bullet that lands on the enemy,
    // hence we only add msToTarget once
    BlueTTKUBOverDistance.push([dist, bulletsToKill * msPerShot + msToTarget])
  }
  return BlueTTKUBOverDistance
}

function APEXGetPurpleTTKUpperBoundOverDistance (weapon) {
  let msPerShot;
  let hs_multi;
  hs_multi = getHSMulti(weapon);
  let hs_dist;
  hs_dist = getMaxHSDist(weapon);
  let ls_multi = getLimbMulti(weapon);
  let fort_multi = getLegendDamageMulti();
  let helm_multi = getHelmMulti(weapon);
  let projectile_multi = getProjectileAmpedMulti();
  let unmodified_damage;
  let damage_out;
  let projectiles_per_shot = getProjectilePerShot(weapon);
  const damages = weapon['damage_array'];
  const distances = weapon['damage_distance_array_m'];
  let bulletVelocity = weapon['projectile_launch_speed_m'];
  const bulletDrag = 0.0; // weapon['projectile_drag_coefficient'];
  if(weapon['effective_fire_rate'] !== undefined){
    msPerShot = 60000 / (weapon['effective_fire_rate']);
  } else {
    msPerShot = 1000 / (weapon['fire_rate']);
  }
  const PurpleTTKUBOverDistance = [];

  // Loop over distance and store damages
  let damageAtDist = 0;
  let msToTarget = 0;
  let bulletsToKill = 0;
  // Used to track how long bullet has been flying
  let bulletFlightSeconds = 0.0;
  let damage_unshielded_scale = getUnShieldedDamageScale(weapon);
  let target_shield = 100;
  let target_health = 100;
  let combined_btk = 0;

  for (let dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {
    unmodified_damage = APEX_InterpolateDamage(dist, damages, distances);
    if ( dist > hs_dist) {
      hs_multi = 1.0;
      helm_multi = 1.0;
    }
    damage_out = ((((((unmodified_damage * projectile_multi) * fort_multi) * hs_multi) * helm_multi) * ls_multi) * projectiles_per_shot);

    damageAtDist = damage_out;
    // Floor because we do not need the last bullet
    if (dist > hs_dist) {
      hs_multi = 1.0;
      helm_multi = 1.0;
    }
    if (damage_unshielded_scale > 1){
      combined_btk = getBTKUsingUnshieldedDamage(damageAtDist, damage_unshielded_scale, target_shield, target_health);
    } else {
      combined_btk = Math.ceil(200 / (damageAtDist * APEX_MIN_DAMAGE_MULTIPLIER))
    }

    target_shield = 100;
    target_health = 100;
    bulletsToKill = combined_btk;

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

const APEXShield_HP = {"None": 0, "White": 50, "Blue": 75, "Purple": 100, "Gold": 100, "Red": 125};

/**
 * @return {number}
 */
function APEXGetBulletsToKillAtDistance(weapon, shieldType, targetDist) {


  let hsMulti;
  let hsMaxDist = getMaxHSDist(weapon);
  let helmMulti;
  let notFlatBTK;






  // hsMulti = getHSMulti(weapon);
  // // let hsDist;
  // // hsDist = getMaxHSDist(weapon);
  // // let lsMulti = getLimbMulti(weapon);
  // // let fortMulti = getLegendDamageMulti();
  // let helmMulti = getHelmMulti(weapon);
  // getProjectileAmpedMulti();
  let baseDamageAtDist;
  // let damageOut;
  // let projectilePerShot = getProjectilePerShot(weapon);
  //   // const damages = weapon['damage_array'];
  //   // const distances = weapon['damage_distance_array_m'];
  // let bulletVelocity = weapon['projectile_launch_speed_m'];
  // const bulletDrag = 0.0; // weapon['projectile_drag_coefficient'];
  //   // let timePerShot;
  //   // if(weapon['effective_fire_rate'] !== undefined){
  //   //   timePerShot = 60000 / (weapon['effective_fire_rate']);
  //   // } else {
  //   //   timePerShot = 1000 / (weapon['fire_rate']);
  //   // }
  //   // const RedTTKUBOverDistance = [];
  //
  // // Loop over distance and store damages
  // let damageAtDist = 0;
  // let msToTarget = 0;
  // let bulletsToKill = 0;
  // // Used to track how long bullet has been flying
  // let bulletFlightSeconds = 0.0;
  let unShieldedDamageScale = getUnShieldedDamageScale(weapon);
  //   // let target_shield = 125;
  // let shieldHP = APEXShield_HP[shieldType];
  //   // let shield_hp = APEXShield_HP.White;
  let targetHP = 100;
  let combinedBTK;


  baseDamageAtDist = APEX_InterpolateDamage(targetDist, weapon['damage_array'], weapon['damage_distance_array_m']);




  let damageAtDist = ((((((baseDamageAtDist * getProjectileAmpedMulti()) * getLegendDamageMulti()) * getHSMulti(weapon)) * getHelmMulti(weapon)) * getLimbMulti(weapon)) * getProjectilePerShot(weapon));

  // damageAtDist = damageOut;
  // Floor because we do not need the last bullet

  if (unShieldedDamageScale > 1) {
    combinedBTK = getBTKUsingUnshieldedDamage(damageAtDist, unShieldedDamageScale, APEXShield_HP[shieldType], targetHP);
  } else {
    combinedBTK = Math.ceil((targetHP + APEXShield_HP[shieldType]) / (damageAtDist * APEX_MIN_DAMAGE_MULTIPLIER))
  }

  // shieldHP = 125;
  // targetHP = 100;
  // bulletsToKill = combinedBTK;

  // let isFlatBTK = false;


  return [combinedBTK, damageAtDist];
}

function isBTKFlat(weapon){


  let notFlatBTK = weapon['allow_headshots'] === "1" && use_headshot_calculations && getMaxHSDist(weapon) <= 120;

  console.log("first test of notFlatBTK, %s", notFlatBTK.toString());

  if (!weapon['damage_array'].every((val, i, arr) => val === arr[0])) {
    notFlatBTK = true;
    console.log("weapon array is not flat notFlat = True %s", notFlatBTK.toString());
  }

  if (notFlatBTK) {
    console.log(" %s weapon's BTK is FLAT", weapon['printname']);
  } else {
    console.log(" %s weapon's BTK is NOT NOT  flat", weapon['printname']);
  }
  return !notFlatBTK;

}

function APEXGetRedTTKUpperBoundOverDistance (weapon) {
  let msPerShot;
  let hs_multi;
  hs_multi = getHSMulti(weapon);
  let hs_dist;
  hs_dist = getMaxHSDist(weapon);
  let ls_multi = getLimbMulti(weapon);
  let fort_multi = getLegendDamageMulti();
  let helm_multi = getHelmMulti(weapon);
  let projectile_multi = getProjectileAmpedMulti();
  let unmodified_damage;
  let damage_out;
  let projectiles_per_shot = getProjectilePerShot(weapon);
  const damages = weapon['damage_array'];
  const distances = weapon['damage_distance_array_m'];
  let bulletVelocity = weapon['projectile_launch_speed_m'];
  const bulletDrag = 0.0; // weapon['projectile_drag_coefficient'];
  if(weapon['effective_fire_rate'] !== undefined){
    msPerShot = 60000 / (weapon['effective_fire_rate']);
  } else {
    msPerShot = 1000 / (weapon['fire_rate']);
  }
  const RedTTKUBOverDistance = [];

  // Loop over distance and store damages
  let damageAtDist = 0;
  let damageAtDistOld = -1;
  let msToTarget = 0;
  let bulletsToKill = 0;

  // Used to track how long bullet has been flying
  let bulletFlightSeconds = 0.0;
  let damage_unshielded_scale = getUnShieldedDamageScale(weapon);
  let target_shield = 125;
  let target_health = 100;
  let combined_btk = 0;
  let damageBTK = [];


  //check if btk is flat
  let isFlat = isBTKFlat(weapon);
  // //check if variable RPM
  let useVariableRPM = (use_charge_spinup_time_calculations && weapon['fire_rate_max_time_speedup'] !== undefined);
  //  //  // if it is flat and not variable. get the damage once then add on travel time for distance
  if(isFlat && !useVariableRPM){

    damageBTK = APEXGetBulletsToKillAtDistance(weapon, "Red", 0);
    bulletsToKill = damageBTK[0];
    damageAtDist = damageBTK[1];


    for (let dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {

      msToTarget = bulletFlightSeconds * 1000;

      // The only time from bullet flight comes from the last bullet that lands on the enemy,
      // hence we only add msToTarget once
      RedTTKUBOverDistance.push([dist, bulletsToKill * msPerShot + msToTarget]);

      // Update bullet velocity and time we are flying
      bulletFlightSeconds += APEX_DAMAGE_RANGE_STEP / bulletVelocity;
      // Update according to drag
      bulletVelocity -= (Math.pow(bulletVelocity, 2) * bulletDrag) * (APEX_DAMAGE_RANGE_STEP / bulletVelocity);

    }
    return RedTTKUBOverDistance


  } else {
    // // if not flat or  is variable loop through distance getting the damage
    for (let dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {

      damageBTK = APEXGetBulletsToKillAtDistance(weapon, "Red", dist);
      bulletsToKill = damageBTK[0];
      damageAtDist = damageBTK[1];


      msToTarget = bulletFlightSeconds * 1000;


      if (useVariableRPM) {

        //TODO:
        RedTTKUBOverDistance.push([dist, testthing(weapon, dist, bulletsToKill, msToTarget)])

      } else {

        //TODO:
        RedTTKUBOverDistance.push([dist, bulletsToKill * msPerShot + msToTarget])
      }

      // Update bullet velocity and time we are flying
      bulletFlightSeconds += APEX_DAMAGE_RANGE_STEP / bulletVelocity;
      // Update according to drag
      bulletVelocity -= (Math.pow(bulletVelocity, 2) * bulletDrag) * (APEX_DAMAGE_RANGE_STEP / bulletVelocity);

      // The only time from bullet flight comes from the last bullet that lands on the enemy,
      // hence we only add msToTarget once
      // console.log(dist, (bulletsToKill * msPerShot + msToTarget));
      // RedTTKUBOverDistance.push([dist, bulletsToKill * msPerShot + msToTarget])
    }
    return RedTTKUBOverDistance

  }
  console.log("hmmmm how did i get here");


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
    let i;
    let attachment_list = [];
    let optic_list = [];
    for (const [key] of Object.entries( weapon['WeaponData']['Mods'])) {
      if(customizationHopupStrings[key] !== undefined) {
        attachment_list.push(key);
      }
      if(customizationAttachmentStrings[key] !== undefined) {
        attachment_list.push(key);
      }
      if(customizationOpticStrings[key] !== undefined) {
        optic_list.push(key);
      }
    }
    weapon['WeaponData']["attachment_list"] = attachment_list;
    weapon['WeaponData']["optic_list"] = optic_list;
    const formatted_name = formatWeaponName(weapon['WeaponData']['printname']);
    weapon['WeaponData']['printname'] = formatted_name.replace(" -", "");
    if(apex_attachments[formatted_name] === undefined){
      apex_attachments[formatted_name] = [];
    }
    for (i = 0; i <  weapon['WeaponData']["attachment_list"].length; i++) {
      if( weapon['WeaponData']['Mods'][ weapon['WeaponData']["attachment_list"][i]] !== undefined) {

        apex_attachments[formatted_name][i] =  weapon['WeaponData']['Mods'][ weapon['WeaponData']["attachment_list"][i]];
        apex_attachments[formatted_name][i].attachName = [ weapon['WeaponData']["attachment_list"][i]];
      }
    }
    if(optic_customizations[formatted_name] === undefined){
      optic_customizations[formatted_name] = [];
    }
    for (i = 0; i <  weapon['WeaponData']["optic_list"].length; i++) {
      if( weapon['WeaponData']['Mods'][ weapon['WeaponData']["optic_list"][i]] !== undefined) {

        optic_customizations[formatted_name][i] =  weapon['WeaponData']['Mods'][ weapon['WeaponData']["optic_list"][i]];
        optic_customizations[formatted_name][i].attachName = [ weapon['WeaponData']["optic_list"][i]];
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

