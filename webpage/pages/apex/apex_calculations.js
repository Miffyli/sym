// Constants for APEX
// Constants for plotting damage/ttk/etc
const DAMAGE_RANGE_START = 0;
const DAMAGE_RANGE_END = 120;
// const DAMAGE_RANGE_STEP = 1;

const MIN_DAMAGE_MULTIPLIER = 1.0;

const Legend_HP = 100.0;
const Shield_HP = {"None": 0, "White": 50, "Blue": 75, "Purple": 100, "Gold": 100, "Red": 125};
const HELM_MULTI = {"None": 1.0, "White": 0.3, "Blue": 0.4, "Purple": 0.5, "Gold": 0.5}

// This will be the main holder of all the selected weapon btk and ttk results.
// An array of dictionaries, each of which is a weapon
// let APEXWeaponBTTKData = [];
let APEXWeaponBTTKData = {};
// let APEXWeaponBTTKDataExample = {
//   "SMG" : {
//       'name': "_SMG_",
//       'white': { 'name': "SMG #0",
//         "btk": [[0, 0], [0, 0], [0, 0]],
//         "ttk": [[0, 0], [0, 0], [0, 0]]
//       },
//       'blue': { 'name': "SMG #0",
//         "btk": [[0, 0], [0, 0], [0, 0]],
//         "ttk": [[0, 0], [0, 0], [0, 0]]
//       }
//   },
//   "AR" : {
//     'name': "_AR_",
//     'white': { 'name': "AR #0",
//       "btk": [[0, 0], [0, 0], [0, 0]],
//       "ttk": [[0, 0], [0, 0], [0, 0]]
//     },
//     'blue': { 'name': "AR #0",
//       "btk": [[0, 0], [0, 0], [0, 0]],
//       "ttk": [[0, 0], [0, 0], [0, 0]]
//     }
//   },
// }

// let BTTKDataEntry = {
//   'name': "_SMG_",
//   'white': { 'name': "SMG #0",
//     "btk": [[0, 0], [0, 0], [0, 0]],
//     "ttk": [[0, 0], [0, 0], [0, 0]]
//   },
//   'blue': { 'name': "SMG #0",
//     "btk": [[0, 0], [0, 0], [0, 0]],
//     "ttk": [[0, 0], [0, 0], [0, 0]]
//   },
//   'purple': { 'name': "SMG #0",
//     "btk": [[0, 0], [0, 0], [0, 0]],
//     "ttk": [[0, 0], [0, 0], [0, 0]]
//   },
//   'red': { 'name': "SMG #0",
//     "btk": [[0, 0], [0, 0], [0, 0]],
//     "ttk": [[0, 0], [0, 0], [0, 0]]
//   }
// }
//


let TTK_vars = {};
let BTK_vars = {};
let BTTK_vars = {};

/*
  Return weapon's damage at given point dist.
  damages and distances specify how much weapon
  does damage at those points, and everything
  else is linearly interpolated between.
*/
/**
 * @return {number}
 */
function APEXInterpolateDamage(dist, damages, distances) {
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

function populateBTTKVars(weapon, shield) {
  BTTK_vars['combined_btk'] = 0;
  BTTK_vars['bulletDrag'] = 0;
  BTTK_vars['msToTarget'] = 0;
  BTTK_vars['msPerShot'] = 0;
  BTTK_vars['bulletFlightSeconds'] = 0;
  BTTK_vars['m_nextPrimaryAttackTime'] = 0.0;
  BTTK_vars['m_lastPrimaryAttack'] = 0.0;
  BTTK_vars['fire_rate_speedup_array'] = [];
  BTTK_vars['fire_rate_array'] = [];

  BTTK_vars['shieldHP'] = Shield_HP[shield];
  BTTK_vars['damages'] = weapon['damage_array'];
  BTTK_vars['distances'] = weapon['damage_distance_array_m'];
  BTTK_vars['bulletVelocity'] = weapon['projectile_launch_speed_m'];

  BTTK_vars['amped_multi'] = getProjectileAmpedMulti();
  BTTK_vars['legend_multi'] = getLegendDamageMulti();
  BTTK_vars['projectiles_per_shot'] = getProjectilePerShot(weapon);
  BTTK_vars['ls_multi'] = getLimbMulti(weapon);
  BTTK_vars['helm_multi'] = getHelmMulti(weapon);
  BTTK_vars['hs_multi'] = getHSMulti(weapon);
  BTTK_vars['damage_unshielded_scale'] = getUnShieldedDamageScale(weapon);
  BTTK_vars['damage_shield_scale'] = getShieldedDamageScale(weapon);

  if ( weapon['headshot_distance_m'] > APEX_DAMAGE_RANGE_END) {
    // flatDmg = true;
    BTTK_vars['flatDmg'] = true;
    // max_hs = APEX_DAMAGE_RANGE_END;
    BTTK_vars['max_hs'] = APEX_DAMAGE_RANGE_END;
  } else {
    BTTK_vars['flatDmg'] = false;
    BTTK_vars['max_hs'] = weapon['headshot_distance_m'];
  }

  if(weapon['effective_fire_rate'] !== undefined){
    BTTK_vars['msPerShot'] = 60000 / (weapon['effective_fire_rate']);
  } else {
    BTTK_vars['msPerShot'] = 1000 / (weapon['fire_rate']);
  }

}
function testCalculateTTK() {

}

function calculateBTK(weapon, shield, dist) {
  let combined_btk;
  let base_dmg;

  if (BTTK_vars.flatDmg) {
    base_dmg = BTTK_vars['damages'][0];
  } else {
    base_dmg = APEXInterpolateDamage(dist, BTTK_vars.damages, BTTK_vars.distances);
    if (dist > BTTK_vars.max_hs) {
      BTTK_vars.hs_multi = 1.0;
      BTTK_vars.helm_multi = 1.0;
    }
    // base_dmg = ((((((base_dmg * BTTK_vars.amped_multi) * BTTK_vars.legend_multi) * BTTK_vars.hs_multi) * BTTK_vars.helm_multi) * BTTK_vars.ls_multi) * BTTK_vars.projectiles_per_shot);
  }
  base_dmg = ((((((base_dmg * BTTK_vars.amped_multi) * BTTK_vars.legend_multi) * BTTK_vars.hs_multi) * BTTK_vars.helm_multi) * BTTK_vars.ls_multi) * BTTK_vars.projectiles_per_shot);

  if (BTTK_vars.damage_unshielded_scale !== 1) {
    combined_btk = getBTKUsingUnshieldedDamage(base_dmg, BTTK_vars.damage_unshielded_scale, BTTK_vars.shieldHP, Legend_HP);
  } else if (BTTK_vars.damage_shield_scale !== 1) {
    combined_btk =  getBTKUsingShieldedDamage(base_dmg, BTTK_vars.damage_shield_scale, BTTK_vars.shieldHP, Legend_HP);
  } else {
    combined_btk =  Math.ceil((Legend_HP + BTTK_vars.shieldHP) / base_dmg)
  }
  return combined_btk;
}

function calculateBTTK(weapon, shield) {
  // Gather all the values needed to calculate BTK and TTK and put into object for as they are calculated for all shields.
  populateBTTKVars(weapon, shield);
  let combined_btk;
  const BTK = [];
  const TTK = [];
  const BTTK = {"BTK": BTK, "TTK": TTK};

  // All weapons non-head shot damage is flat except the charge rifle, but its damage drop is at hundreds of meters.
  // check is the weapons HS drop is within our charts range. If it is not, then just calculate the BTK once and use it for all ranges.

  if (BTTK_vars['flatDmg']) {
    // Weapons damage model is flat. Calculate BTK once.
    combined_btk = calculateBTK(weapon, shield, 0);
  }

  // Loop over distance and store damages
  for (let dist = APEX_DAMAGE_RANGE_START; dist <= APEX_DAMAGE_RANGE_END; dist += APEX_DAMAGE_RANGE_STEP) {
    if (BTTK_vars.flatDmg) {
      // Damage model is flat, apply the previously calculated BTK and apply it across all ranged just adding bullet time.
      BTK.push([dist, combined_btk]);
      BTTK_vars.msToTarget = BTTK_vars.bulletFlightSeconds * 1000;

      // Update bullet velocity and time we are flying
      BTTK_vars.bulletFlightSeconds += APEX_DAMAGE_RANGE_STEP / BTTK_vars.bulletVelocity;

      // Update according to drag
      BTTK_vars.bulletVelocity -= (Math.pow(BTTK_vars.bulletVelocity, 2) * BTTK_vars.bulletDrag) * (APEX_DAMAGE_RANGE_STEP / BTTK_vars.bulletVelocity);

      // The only time from bullet flight comes from the last bullet that lands on the enemy,
      // hence we only add msToTarget once
      // console.log(dist, (combined_btk * msPerShot + msToTarget));
      TTK.push([dist, (combined_btk - 1) * BTTK_vars.msPerShot + BTTK_vars.msToTarget])
    } else {
      let dist_btk = calculateBTK(weapon, shield, dist);
      BTK.push([dist, dist_btk]);

      BTTK_vars.msToTarget = BTTK_vars.bulletFlightSeconds * 1000;
      // Update bullet velocity and time we are flying
      BTTK_vars.bulletFlightSeconds += APEX_DAMAGE_RANGE_STEP / BTTK_vars.bulletVelocity;
      // Update according to drag
      BTTK_vars.bulletVelocity -= (Math.pow(BTTK_vars.bulletVelocity, 2) * BTTK_vars.bulletDrag) * (APEX_DAMAGE_RANGE_STEP / BTTK_vars.bulletVelocity);

      //TODO: check/setup Charge Rifle to charge values  m_nextPrimaryAttackTime
      // if (weapon['charge_attack_min_charge_required'] && weapon['charge_time'] > 0.01)// Havok
      if (use_charge_spinup_time_calculations && weapon['fire_rate_max_time_speedup'] !== undefined){

        BTTK_vars.m_nextPrimaryAttackTime = 0.0;
        BTTK_vars.m_lastPrimaryAttack = 0.0;

        BTTK_vars.fire_rate_array = [weapon['fire_rate'], weapon['fire_rate_max']];
        BTTK_vars.fire_rate_speedup_array = [0.0, weapon['fire_rate_max_time_speedup']];

        for (let cur_bullet = 0; cur_bullet <= (dist_btk - 1); cur_bullet += 1) {
          BTTK_vars.m_lastPrimaryAttack += BTTK_vars.m_nextPrimaryAttackTime;
          BTTK_vars.m_nextPrimaryAttackTime = 1 / (APEXInterpolateDamage(BTTK_vars.m_lastPrimaryAttack, BTTK_vars.fire_rate_array, BTTK_vars.fire_rate_speedup_array));

          // TODO: remove, if dist less then = 0, log the values for a one debug/check
          if (dist <= 0) {
            console.log("APEXGetTTK dist %d cur_bullet: %d of(BTK): %d, m_lastPrimaryAttack: %f, m_nextPrimaryAttackTime: %f  ", dist, cur_bullet, combined_btk, BTTK_vars.m_lastPrimaryAttack, BTTK_vars.m_nextPrimaryAttackTime);
          }
        }

        // The only time from bullet flight comes from the last bullet that lands on the enemy,
        // hence we only add msToTarget once
        TTK.push([dist, (BTTK_vars.m_lastPrimaryAttack * 1000) + BTTK_vars.msToTarget])

      } else {

        // The only time from bullet flight comes from the last bullet that lands on the enemy,
        // hence we only add msToTarget once
        TTK.push([dist, (dist_btk - 1) * BTTK_vars.msPerShot + BTTK_vars.msToTarget])
      }
    }
  }
  return BTTK
}

// iterates through selected weapons array and calculates the BTK for every shield type then saves the results as part of the APEXWeaponBTTKData object
// reference APEXWeaponBTTKData when calculating TTK so btk no longer needs to calculated twice for every weapon.
// obj is global. create function that iterates through it and creates high chart ttk and  btk tables.
function populateBTTKData(selectedWeapons) {
  APEXWeaponBTTKData = {};

  for (let i = 0; i < selectedWeapons.length; i++) {
    const weapon = selectedWeapons[i] ;
    let wpnName = apex_weapon_name_dict[weapon['printname']]+ " #"+i;
    APEXWeaponBTTKData[wpnName] = {};
    let curBTTKWeapon = APEXWeaponBTTKData[wpnName];

    Object.keys(Shield_HP).forEach(function (shieldColor) {
      curBTTKWeapon[shieldColor] = [];
      curBTTKWeapon[shieldColor].push({
        name: wpnName,
        BTTK: calculateBTTK(weapon, shieldColor, 'None')
      });
    })
  }
}
