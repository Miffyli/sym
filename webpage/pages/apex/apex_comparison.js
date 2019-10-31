// Logic behind comparison pages

//bool for using HS/Limp multis
let use_hs_multi_calculations = false;
let use_ls_multi_calculations = false;
let use_lowprofile_calculations = false;
let use_fortified_calculations = false;
// Text for the "no weapon selected" box
const SELECT_OPTION_1_TEXT = 'Select Weapon...';

// Color codes for the best/worst value
const APEX_NEUTRAL_VALUE_COLOR = [255, 255, 255];
const APEX_BEST_VALUE_COLOR = [0, 255, 0];
const APEX_WORST_VALUE_COLOR = [255, 0, 0];

// Array used to generate customizations buttons for each weapon
// The array is generated in a function below
const APEXCustomizationsArray = [];

// Used to prepend to id of customization buttons to make them all unique
// in order to accommodate multiple instances of the same weapon.
let APEXAddVariantCounter = 0;

let use_headshot_calculations = false;

/* These mappings are used for the labels on the customization buttons
   These need to be updated if DICE comes out with new customization types.
*/
const APEXCustomizationStrings = {};
APEXCustomizationStrings.bullets_mag_l1 = "White Extended Light Mag";
APEXCustomizationStrings.bullets_mag_l2 = "Blue Extended Light Mag";
APEXCustomizationStrings.bullets_mag_l3 = "Purple Extended Light Mag";
APEXCustomizationStrings.bullets_mag_l4 = "Gold Extended Light Mag";
APEXCustomizationStrings.barrel_stabilizer_l1 = "White Barrel Stabilizer";
APEXCustomizationStrings.barrel_stabilizer_l2 = "Blue Barrel Stabilizer";
APEXCustomizationStrings.barrel_stabilizer_l3 = "Purple Barrel Stabilizer";
APEXCustomizationStrings.barrel_stabilizer_l4_flash_hider = "Gold Barrel Stabilizer";
APEXCustomizationStrings.shotgun_bolt_l1 = "White Shotgun Bolt";
APEXCustomizationStrings.shotgun_bolt_l2 = "Blue Shotgun Bolt";
APEXCustomizationStrings.shotgun_bolt_l3 = "Purple Shotgun Bolt";
APEXCustomizationStrings.shotgun_bolt_l4 = "Gold Shotgun Bolt";
APEXCustomizationStrings.stock_sniper_l1 = "White Sniper Stock";
APEXCustomizationStrings.stock_sniper_l2 = "Blue Sniper Stock";
APEXCustomizationStrings.stock_sniper_l3 = "Purple Sniper Stock";
APEXCustomizationStrings.stock_sniper_l4 = "Gold Sniper Stock";
APEXCustomizationStrings.stock_tactical_l1 = "White Standard Stock";
APEXCustomizationStrings.stock_tactical_l2 = "Blue Standard Stock";
APEXCustomizationStrings.stock_tactical_l3 = "Purple Standard Stock";
APEXCustomizationStrings.stock_tactical_l4 = "Gold Standard Stock";
APEXCustomizationStrings.energy_mag_l1 = "White Extended Energy Mag";
APEXCustomizationStrings.energy_mag_l2 = "Blue Extended Energy Mag";
APEXCustomizationStrings.energy_mag_l3 = "Purple Extended Energy Mag";
APEXCustomizationStrings.energy_mag_l4 = "Gold Extended Energy Mag";
APEXCustomizationStrings.highcal_mag_l1 = "White Extended Heavy Mag";
APEXCustomizationStrings.highcal_mag_l2 = "Blue Extended Heavy Mag";
APEXCustomizationStrings.highcal_mag_l3 = "Purple Extended Heavy Mag";
APEXCustomizationStrings.highcal_mag_l4 = "Gold Extended Heavy Mag";
// Base Weapon Attachments Strings
// APEXCustomizationStrings.barrel_stabilizer_l1 = "White Barrel Stabilizer";
// APEXCustomizationStrings.barrel_stabilizer_l2 = "Blue Barrel Stabilizer";
// APEXCustomizationStrings.barrel_stabilizer_l3 = "Purple Barrel Stabilizer";
// APEXCustomizationStrings.barrel_stabilizer_l4_flash_hider = "Gold Barrel Stabilizer";
// APEXCustomizationStrings.bullets_mag_l1 = "White Extended Light Mag";
// APEXCustomizationStrings.bullets_mag_l2 = "Blue Extended Light Mag";
// APEXCustomizationStrings.bullets_mag_l3 = "Purple Extended Light Mag";
// APEXCustomizationStrings.bullets_mag_l4 = "Gold Extended Light Mag";
// APEXCustomizationStrings.energy_mag_l1 = "White Extended Energy Mag";
// APEXCustomizationStrings.energy_mag_l2 = "Blue Extended Energy Mag";
// APEXCustomizationStrings.energy_mag_l3 = "Purple Extended Energy Mag";
// APEXCustomizationStrings.energy_mag_l4 = "Gold Extended Energy Mag";
// APEXCustomizationStrings.highcal_mag_l1 = "White Extended Heavy Mag";
// APEXCustomizationStrings.highcal_mag_l2 = "Blue Extended Heavy Mag";
// APEXCustomizationStrings.highcal_mag_l3 = "Purple Extended Heavy Mag";
// APEXCustomizationStrings.highcal_mag_l4 = "Gold Extended Heavy Mag";
// APEXCustomizationStrings.shotgun_bolt_l1 = "White Shotgun Bolt";
// APEXCustomizationStrings.shotgun_bolt_l2 = "Blue Shotgun Bolt";
// APEXCustomizationStrings.shotgun_bolt_l3 = "Purple Shotgun Bolt";
// APEXCustomizationStrings.shotgun_bolt_l4 = "Gold Shotgun Bolt";
// APEXCustomizationStrings.stock_sniper_l1 = "White Sniper Stock";
// APEXCustomizationStrings.stock_sniper_l2 = "Blue Sniper Stock";
// APEXCustomizationStrings.stock_sniper_l3 = "Purple Sniper Stock";
// APEXCustomizationStrings.stock_sniper_l4 = "Gold Sniper Stock";
// APEXCustomizationStrings.stock_tactical_l1 = "White Standard Stock";
// APEXCustomizationStrings.stock_tactical_l2 = "Blue Standard Stock";
// APEXCustomizationStrings.stock_tactical_l3 = "Purple Standard Stock";
// APEXCustomizationStrings.stock_tactical_l4 = "Gold Standard Stock";
// Base Weapon Attachments Icons
APEXCustomizationStrings.stock_sniper_l1 = "stock_sniper_l1";
APEXCustomizationStrings.stock_sniper_l2 = "stock_sniper_l2";
APEXCustomizationStrings.stock_sniper_l3 = "stock_sniper_l3";
APEXCustomizationStrings.stock_sniper_l4 = "stock_sniper_l4";
APEXCustomizationStrings.stock_tactical_l1 = "stock_tactical_l1";
APEXCustomizationStrings.stock_tactical_l2 = "stock_tactical_l2";
APEXCustomizationStrings.stock_tactical_l3 = "stock_tactical_l3";
APEXCustomizationStrings.stock_tactical_l4 = "stock_tactical_l4";
APEXCustomizationStrings.shotgun_bolt_l1 = "shotgun_bolt_l1";
APEXCustomizationStrings.shotgun_bolt_l2 = "shotgun_bolt_l2";
APEXCustomizationStrings.shotgun_bolt_l3 = "shotgun_bolt_l3";
APEXCustomizationStrings.shotgun_bolt_l4 = "shotgun_bolt_l4";
APEXCustomizationStrings.bullets_mag_l1 = "bullets_mag_l1";
APEXCustomizationStrings.bullets_mag_l2 = "bullets_mag_l2";
APEXCustomizationStrings.bullets_mag_l3 = "bullets_mag_l3";
APEXCustomizationStrings.bullets_mag_l4 = "bullets_mag_l4";
APEXCustomizationStrings.energy_mag_l1 = "energy_mag_l1";
APEXCustomizationStrings.energy_mag_l2 = "energy_mag_l2";
APEXCustomizationStrings.energy_mag_l3 = "energy_mag_l3";
APEXCustomizationStrings.energy_mag_l4 = "energy_mag_l4";
APEXCustomizationStrings.highcal_mag_l1 = "highcal_mag_l1";
APEXCustomizationStrings.highcal_mag_l2 = "highcal_mag_l2";
APEXCustomizationStrings.highcal_mag_l3 = "highcal_mag_l3";
APEXCustomizationStrings.highcal_mag_l4 = "highcal_mag_l4";
APEXCustomizationStrings.barrel_stabilizer_l1 = "barrel_stabilizer_l1";
APEXCustomizationStrings.barrel_stabilizer_l2 = "barrel_stabilizer_l2";
APEXCustomizationStrings.barrel_stabilizer_l3 = "barrel_stabilizer_l3";
APEXCustomizationStrings.barrel_stabilizer_l4_flash_hider = "barrel_stabilizer_l4_flash_hider";

// Weapon Optics
APEXCustomizationStrings.optic_cq_hcog_bruiser = "optic_cq_hcog_bruiser";
APEXCustomizationStrings.optic_cq_hcog_classic = "optic_cq_hcog_classic";
APEXCustomizationStrings.optic_cq_holosight = "optic_cq_holosight";
APEXCustomizationStrings.optic_cq_holosight_variable = "optic_cq_holosight_variable";
APEXCustomizationStrings.optic_cq_threat = "optic_cq_threat";
APEXCustomizationStrings.optic_ranged_aog_variable = "optic_ranged_aog_variable";
APEXCustomizationStrings.optic_ranged_hcog = "optic_ranged_hcog";
APEXCustomizationStrings.optic_sniper = "optic_sniper";
APEXCustomizationStrings.optic_sniper_threat = "optic_sniper_threat";
APEXCustomizationStrings.optic_sniper_variable = "optic_sniper_variable";
APEXCustomizationStrings.hopup_double_tap = "hopup_double_tap";
APEXCustomizationStrings.hopup_energy_choke = "hopup_energy_choke";
APEXCustomizationStrings.hopup_headshot_dmg = "hopup_headshot_dmg";
APEXCustomizationStrings.hopup_highcal_rounds = "hopup_highcal_rounds";
APEXCustomizationStrings.hopup_selectfire = "hopup_selectfire";
APEXCustomizationStrings.hopup_shield_breaker = "hopup_shield_breaker";
APEXCustomizationStrings.hopup_turbocharger = "hopup_turbocharger";
APEXCustomizationStrings.hopup_unshielded_dmg = "hopup_unshielded_dmg";
APEXCustomizationStrings.hopup_multiplexer = "hopup_multiplexer";

/*
  Return list of select weapons (the
  full directory), according to
  select weapon names and attachments.
*/
function APEXGetSelectedWeapons () {
  const selectedWeapons = [];

  $('.apex_comp-selectorContainer').each(function () {
    if ($(this).find('select')[0].selectedIndex !== 0) {
      const selectedAttachments = $(this).find('select option:selected').text().trim();
      // $(this).find('.customButton').each(function () {
      //   if ($(this).is(':checked')) {
      //     selectedAttachments += $(this).next('label').data('shortname')
      //   }
      // })

      var weaponStats = APEXWeaponData.find(function (element) {
        return element.WeaponData.printname === selectedAttachments
      });
      selectedWeapons.push(weaponStats.WeaponData)
    }
  });
  return selectedWeapons
}

/*
  Return true if given variable should be included in the
  datatable, false otherwise.
  variableName: Name of the variable
  weaponValues: List of values of variableName from different weapons
  filters: List of filter keywords
  includeOnlyDiffering: If false, only include variables where weapons differ
*/
function APEXFilterTable (variableName, weaponValues, filters, includeOnlyDiffering) {
  var shouldInclude = true;

  // Hardcoded: Only include numeric values in the table (including "N/A")
  // TODO this should be done before-hand
  shouldInclude = weaponValues.every(weaponValue => (!isNaN(weaponValue) || weaponValue === 'N/A'));

  // If we have keywords, check if we match them
  if (filters.length > 0) {
    // Check if variableName is among filters
    var lowercaseVariableName = variableName.toLowerCase();
    // "At least one of the filters is in variableName"
    shouldInclude = shouldInclude && filters.some(filter => lowercaseVariableName.includes(filter))
  }

  if (includeOnlyDiffering === true) {
    // Check if all values match the first one.
    shouldInclude = shouldInclude && !weaponValues.every(weaponValue => weaponValue === weaponValues[0])
  }

  return shouldInclude
}

/*
  Return an array of color codes, each representing the color to be used
  for that value. Used in the comparison to color values from best to worse.
  variableName: Name of the variable
  weaponValues: List of values for variableName from different weapons
*/
function APEXColorVariables(variableName, weaponValues) {
  var colorCodes;

  if (weaponValues.length === 1 || weaponValues.some(weaponValue => isNaN(weaponValue))) {
    // Only one item in the list or there are non-numeric values
    // -> Return neutral color
    colorCodes = weaponValues.map(weaponValue => APEX_NEUTRAL_VALUE_COLOR)
  } else {
    // Get unique values
    var uniqueValues = Array.from(new Set(weaponValues));
    // If we only have , do not bother with coloring
    if (uniqueValues.length === 1) {
      colorCodes = weaponValues.map(weaponValue => APEX_NEUTRAL_VALUE_COLOR)
    } else {
      // Sort by value so that "lower is worse".
      // TODO reverse if variableName is one of "lower is better"
      uniqueValues.sort();

      colorCodes = [];
      // Lower rank in uniqueValues -> worse value
      for (let i = 0; i < weaponValues.length; i++) {
        // -1 so that final value (best) has APEX_BEST_VALUE_COLOR
        let rankRatio = uniqueValues.indexOf(weaponValues[i]) / (uniqueValues.length - 1);
        colorCodes.push(
          APEXInterpolateRGB(APEX_WORST_VALUE_COLOR, APEX_BEST_VALUE_COLOR, rankRatio)
        )
      }
    }
  }
  // Turn RGB arrays to html color code
  colorCodes = colorCodes.map(colorCode => APEXArrayToRGB(colorCode));
  return colorCodes
}

/*
  Update weapon table (i.e. create from scratch)
  with currently selected weapons and filters.
  Takes in a list of selected weapons, filter keywords (list)
  and boolean if only differing values should be included.
*/
function APEXUpdateTable (selectedWeapons, filters, includeOnlyDiffering) {
  if (selectedWeapons.length > 0) {
    // Construct table as a HTML string we append later
    // to correct table. Hopefully this is fast enough.
    // Start with headers
    var tableHtml = '<table><tr><th></th>';
    for (var i = 0; i < selectedWeapons.length; i++) {
      // Also add weapon name to table headers
      tableHtml += '<th>' + selectedWeapons[i]['custom_name'] + '</th>'
    }
    tableHtml += '</tr>';

    // Now for each row, show variable name and numbers
    for (var variableIndex = 0; variableIndex < APEXWeaponKeys.length; variableIndex++) {
      // Check filtering: Get variable name and the values, check if want
      // to include that variable and then include it
      var variableKey = APEXWeaponKeys[variableIndex];
      var weaponVariables = selectedWeapons.map(weapon => weapon[variableKey]);

      if (APEXFilterTable(variableKey, weaponVariables, filters, includeOnlyDiffering) === true) {
        // Get coloring of the items
        var variableColoring = APEXColorVariables(variableKey, weaponVariables);
        // Begin row and add variable name
        tableHtml += '<tr><td>' + variableKey + '</td>';
        for (var weaponIndex = 0; weaponIndex < weaponVariables.length; weaponIndex++) {
          tableHtml += `<td style="color: ${variableColoring[weaponIndex]}"> ${weaponVariables[weaponIndex]} </td>`
        }
        tableHtml += '</tr>'
      }
    }
    tableHtml += '</table>';

    // Place table to its location
    $('#compare_table').html(tableHtml)
  }
}

/*
  Update damage graph with the selected weapons.
  Takes in a list of selected weapons.
*/
function APEXUpdateDamageGraph (selectedWeapons) {
  var series = [];
  for (var i = 0; i < selectedWeapons.length; i++) {
    var weapon = selectedWeapons[i];
    series.push({
      name: weapon['custom_name'],
      data: APEXGetDamageOverDistance(weapon)
    })
  }

  Highcharts.chart('damage_graph', {
    title: {
      text: 'Damage over distance'
    },

    yAxis: {
      title: {
        text: 'Damage'
      }
    },

    xAxis: {
      title: {
        text: 'Distance (m)'
      }
    },

    tooltip: {
      shared: true,
      formatter: function() {
        let dmg_tooltip_str = this.x + "m";
        const sortedPoints = this.points.sort(function (a, b) {
          return ((a.y > b.y) ? -1 : ((a.y < b.y) ? 1 : 0));
        });
        $.each(sortedPoints , function(i, point) {
          dmg_tooltip_str += `<br/><span style="color:${point.color}">●</span>${point.series.name}: <b>${point.y.toFixed(3)}</b>`;
        });
        return dmg_tooltip_str;
      },
    },

    plotOptions: {
      line: {
        marker: {
          enabled: false
        }
      }
    },

    series: series
  })
}

/*
  Update BTK and TTK graphs according to selected weapons.
  Takes in a list of selected weapons.
*/
function APEXUpdateTTKAndBTKGraphs (selectedWeapons) {
  var btk_series = [];
  var btk_white_series = [];
  var btk_blue_series = [];
  var btk_purple_series = [];
  var ttk_series = [];
  var ttk_white_series = [];
  var ttk_blue_series = [];
  var ttk_purple_series = [];
  for (let i = 0; i < selectedWeapons.length; i++) {
    const weapon = selectedWeapons[i];
    btk_white_series.push({
      name: weapon['custom_name'],
      data: APEXGetWhiteBTKUpperBoundOverDistance(weapon)
    });
    ttk_white_series.push({
      name: weapon['custom_name'],
      data: APEXGetWhiteTTKUpperBoundOverDistance(weapon)
    });
    btk_blue_series.push({
      name: weapon['custom_name'],
      data: APEXGetBlueBTKUpperBoundOverDistance(weapon)
    });
    ttk_blue_series.push({
      name: weapon['custom_name'],
      data: APEXGetBlueTTKUpperBoundOverDistance(weapon)
    });
    btk_purple_series.push({
      name: weapon['custom_name'],
      data: APEXGetPurpleBTKUpperBoundOverDistance(weapon)
    });
    ttk_purple_series.push({
      name: weapon['custom_name'],
      data: APEXGetPurpleTTKUpperBoundOverDistance(weapon)
    });
    btk_series.push({
      name: weapon['custom_name'],
      data: APEXGetBTKUpperBoundOverDistance(weapon)
    });
    ttk_series.push({
      name: weapon['custom_name'],
      data: APEXGetTTKUpperBoundOverDistance(weapon)
    })
  }

  Highcharts.chart('btkub_graph', {
    title: {
      text: 'Bullets-to-kill upper bound'
    },

    subtitle: {
      text: 'Maximum number of bullets required for a kill. Includes multipliers.'
    },

    yAxis: {
      title: {
        text: 'Bullets'
      }
    },

    xAxis: {
      title: {
        text: 'Distance (m)'
      }
    },

    tooltip: {
      shared: true,
      formatter: function() {
        let btk_tooltip_str = this.x + "m";
        const sortedPoints = this.points.sort(function (a, b) {
          return ((a.y > b.y) ? -1 : ((a.y < b.y) ? 1 : 0));
        });
        $.each(sortedPoints , function(i, point) {
          btk_tooltip_str += `<br/><span style="color:${point.color}">●</span>${point.series.name}: <b>${point.y}</b>`;
        });
        return btk_tooltip_str;
      },
    },

    plotOptions: {
      line: {
        marker: {
          enabled: false
        }
      }
    },

    series: btk_series
  });
  Highcharts.chart('ttkub_graph', {
    title: {
      text: 'Time-to-kill upper bound'
    },

    subtitle: {
      text: 'Based on "RoF". Assumes all shots hit. Includes bullet velocity. Includes multipliers.'
    },

    yAxis: {
      title: {
        text: 'Time (ms)'
      }
    },

    xAxis: {
      title: {
        text: 'Distance (m)'
      }
    },

    tooltip: {
      shared: true,
      // valueDecimals: 3,
      formatter: function() {
        let ttk_tooltip_str = this.x + "m";
        const sortedPoints = this.points.sort(function (a, b) {
          return ((a.y > b.y) ? -1 : ((a.y < b.y) ? 1 : 0));
        });
        $.each(sortedPoints , function(i, point) {
          ttk_tooltip_str += `<br/><span style="color:${point.color}">●</span>${point.series.name}:<b>${point.y.toFixed(3)}</b>`;
        });
        return ttk_tooltip_str;
      },
    },

    plotOptions: {
      line: {
        marker: {
          enabled: false
        }
      }
    },

    series: ttk_series
  });

  Highcharts.chart('white_btkub_graph', {
    title: {
      text: 'Bullets-to-kill w/ White Shield'
    },

    subtitle: {
      text: 'Maximum number of bullets required for a kill. Includes multipliers.'
    },

    yAxis: {
      title: {
        text: 'Bullets'
      }
    },

    xAxis: {
      title: {
        text: 'Distance (m)'
      }
    },

    tooltip: {
      shared: true,
      formatter: function() {
        let btk_tooltip_str = this.x + "m";
        const sortedPoints = this.points.sort(function (a, b) {
          return ((a.y > b.y) ? -1 : ((a.y < b.y) ? 1 : 0));
        });
        $.each(sortedPoints , function(i, point) {
          btk_tooltip_str += `<br/><span style="color:${point.color}">●</span>${point.series.name}: <b>${point.y}</b>`;
        });
        return btk_tooltip_str;
      },
    },

    plotOptions: {
      line: {
        marker: {
          enabled: false
        }
      }
    },

    series: btk_white_series
  });
  Highcharts.chart('white_ttkub_graph', {
    title: {
      text: 'Time-to-kill w/ White Shield'
    },

    subtitle: {
      text: 'Based on "RoF". Assumes all shots hit. Includes bullet velocity. Includes multipliers.'
    },

    yAxis: {
      title: {
        text: 'Time (ms)'
      }
    },

    xAxis: {
      title: {
        text: 'Distance (m)'
      }
    },

    tooltip: {
      shared: true,
      // valueDecimals: 3,
      formatter: function() {
        let ttk_tooltip_str = this.x + "m";
        const sortedPoints = this.points.sort(function (a, b) {
          return ((a.y > b.y) ? -1 : ((a.y < b.y) ? 1 : 0));
        });
        $.each(sortedPoints , function(i, point) {
          ttk_tooltip_str += `<br/><span style="color:${point.color}">●</span>${point.series.name}:<b>${point.y.toFixed(3)}</b>`;
        });
        return ttk_tooltip_str;
      },
    },

    plotOptions: {
      line: {
        marker: {
          enabled: false
        }
      }
    },

    series: ttk_white_series
  });

  Highcharts.chart('blue_btkub_graph', {
    title: {
      text: 'Bullets-to-kill w/ Blue Shield'
    },

    subtitle: {
      text: 'Maximum number of bullets required for a kill. Includes multipliers.'
    },

    yAxis: {
      title: {
        text: 'Bullets'
      }
    },

    xAxis: {
      title: {
        text: 'Distance (m)'
      }
    },

    tooltip: {
      shared: true,
      formatter: function() {
        let btk_tooltip_str = this.x + "m";
        const sortedPoints = this.points.sort(function (a, b) {
          return ((a.y > b.y) ? -1 : ((a.y < b.y) ? 1 : 0));
        });
        $.each(sortedPoints , function(i, point) {
          btk_tooltip_str += `<br/><span style="color:${point.color}">●</span>${point.series.name}: <b>${point.y}</b>`;
        });
        return btk_tooltip_str;
      },
    },

    plotOptions: {
      line: {
        marker: {
          enabled: false
        }
      }
    },

    series: btk_blue_series
  });
  Highcharts.chart('blue_ttkub_graph', {
    title: {
      text: 'Time-to-kill w/ Blue Shield'
    },

    subtitle: {
      text: 'Based on "RoF". Assumes all shots hit. Includes bullet velocity. Includes multipliers.'
    },

    yAxis: {
      title: {
        text: 'Time (ms)'
      }
    },

    xAxis: {
      title: {
        text: 'Distance (m)'
      }
    },

    tooltip: {
      shared: true,
      // valueDecimals: 3,
      formatter: function() {
        let ttk_tooltip_str = this.x + "m";
        const sortedPoints = this.points.sort(function (a, b) {
          return ((a.y > b.y) ? -1 : ((a.y < b.y) ? 1 : 0));
        });
        $.each(sortedPoints , function(i, point) {
          ttk_tooltip_str += `<br/><span style="color:${point.color}">●</span>${point.series.name}:<b>${point.y.toFixed(3)}</b>`;
        });
        return ttk_tooltip_str;
      },
    },

    plotOptions: {
      line: {
        marker: {
          enabled: false
        }
      }
    },

    series: ttk_blue_series
  });

  Highcharts.chart('purple_btkub_graph', {
    title: {
      text: 'Bullets-to-kill /w Purple Shield'
    },

    subtitle: {
      text: 'Maximum number of bullets required for a kill. Includes multipliers.'
    },

    yAxis: {
      title: {
        text: 'Bullets'
      }
    },

    xAxis: {
      title: {
        text: 'Distance (m)'
      }
    },

    tooltip: {
      shared: true,
      formatter: function() {
        let btk_tooltip_str = this.x + "m";
        const sortedPoints = this.points.sort(function (a, b) {
          return ((a.y > b.y) ? -1 : ((a.y < b.y) ? 1 : 0));
        });
        $.each(sortedPoints , function(i, point) {
          btk_tooltip_str += `<br/><span style="color:${point.color}">●</span>${point.series.name}: <b>${point.y}</b>`;
        });
        return btk_tooltip_str;
      },
    },

    plotOptions: {
      line: {
        marker: {
          enabled: false
        }
      }
    },

    series: btk_purple_series
  });
  Highcharts.chart('purple_ttkub_graph', {
    title: {
      text: 'Time-to-kill w/ Purple Shield'
    },

    subtitle: {
      text: 'Based on "RoF". Assumes all shots hit. Includes bullet velocity. Includes multipliers.'
    },

    yAxis: {
      title: {
        text: 'Time (ms)'
      }
    },

    xAxis: {
      title: {
        text: 'Distance (m)'
      }
    },

    tooltip: {
      shared: true,
      // valueDecimals: 3,
      formatter: function() {
        let ttk_tooltip_str = this.x + "m";
        const sortedPoints = this.points.sort(function (a, b) {
          return ((a.y > b.y) ? -1 : ((a.y < b.y) ? 1 : 0));
        });
        $.each(sortedPoints , function(i, point) {
          ttk_tooltip_str += `<br/><span style="color:${point.color}">●</span>${point.series.name}:<b>${point.y.toFixed(3)}</b>`;
        });
        return ttk_tooltip_str;
      },
    },

    plotOptions: {
      line: {
        marker: {
          enabled: false
        }
      }
    },

    series: ttk_purple_series
  })

}

// function comparator(a, b) {
//   return a.series["name"] > b.series["name"];
// }
/*
  Callback function for when filters change
  (only redo table, not graphs).
*/
function APEXFilterOnChange () {
  var selectedWeapons = APEXGetSelectedWeapons();

  var filters = $('#column_filter')[0].value.toLowerCase();
  var includeOnlyDiffering = $('#column_onlydiffering')[0].checked;
  filters = filters.split(',');

  APEXUpdateTable(selectedWeapons, filters, includeOnlyDiffering)
}

function APEXUpdateFromToolBar(){
  var selectedWeapons = APEXGetSelectedWeapons();

  // Get filters for updating the table.
  let filters = $('#column_filter')[0].value.toLowerCase();
  let includeOnlyDiffering = $('#column_onlydiffering')[0].checked;
  filters = filters.split(',');

  APEXUpdateTable(selectedWeapons, filters, includeOnlyDiffering);
  APEXUpdateDamageGraph(selectedWeapons);
  APEXUpdateTTKAndBTKGraphs(selectedWeapons)
}
/*
  Callback function for when one of the UI selectors changes
  (different weapon, different attachments, different
  filters)
*/
function APEXSelectorsOnChange (e) {
  apex_updateSelectors();
  printAPEXCustomizationButtons(e);
  var selectedWeapons = APEXGetSelectedWeapons();

  // Get filters for updating the table.
  let filters = $('#column_filter')[0].value.toLowerCase();
  let includeOnlyDiffering = $('#column_onlydiffering')[0].checked;
  filters = filters.split(',');

  APEXUpdateTable(selectedWeapons, filters, includeOnlyDiffering);
  APEXUpdateDamageGraph(selectedWeapons);
  APEXUpdateTTKAndBTKGraphs(selectedWeapons)
}

/*
  Check correct number of selectors
  and if one of them should be removed
*/
function apex_updateSelectors () {
  $('.apex_comp-selectorContainer > select').each(function() {
    if (this.selectedIndex === 0 && $('.apex_comp-selectorContainer > select').length > 1) {
      $(this).parent().remove()
    }
  });

  var emptySelects = 0;
  $('.apex_comp-selectorContainer > select').each(function() {
    if (this.selectedIndex === 0) {
      emptySelects++
    }
  });

  if (emptySelects === 0 && $('.apex_comp-selectorContainer').length < 26) {
    $('.apex_comp-selectorContainer').last().after($('.apex_comp-selectorContainer').first().clone(true));
    $('.apex_comp-selectorContainer').last().children('div').remove();
    $('.apex_comp-selectorContainer').last().children('select').change(function (e) {
      APEXSelectorsOnChange(e)
    })
  }
}

/*
  Entrypoint for the comparison page.
  Note: This should called after all data has been loaded!
*/
function initializeAPEXComparison () {
  var selectorParent = $('#selectors')[0];

  // TODO Create proper selectors
  //      (one for weapon and another for attachments)
  //      (Fill in possible weapons etc)

  // Create different options (i.e. weapons)
  // and add them to first selector
  var firstSelector = document.createElement('select');
  firstSelector.onchange = APEXSelectorsOnChange;
  // First add empty option
  var option = document.createElement('option');
  option.text = SELECT_OPTION_1_TEXT;
  firstSelector.add(option);
  // var weaponNames = APEXWeaponData.filter(
  //     weapon => weapon.WeaponData== ""
  //   // weapon => weapon['Attachments_short'] == ""
  // ).map(
  //   weapon => weapon['printname']
  // )
  var weaponNames = APEXWeaponData.filter(
      weapon => weapon["WeaponData"]["weapon_type_flags"] === "WPT_PRIMARY"
  ).map(
      weapon => weapon["WeaponData"]["printname"]
  );
  weaponNames.sort();
  for (var i = 0; i < weaponNames.length; i++) {
    option = document.createElement('option');
  option.text = weaponNames[i];
  firstSelector.add(option)
}
  selectorParent.appendChild(firstSelector);

  // Set oninput for filter elements
  document.getElementById('column_filter').oninput = APEXFilterOnChange;
  document.getElementById('column_onlydiffering').onclick = APEXFilterOnChange;

  apex_updateSelectors();

  $("#apex_showHideShieldTypes input").checkboxradio(
      {icon:false}
  );
  $("#apex_showHideShieldTypes input").change(function(){
    this.blur();
    showHideGraphs();
  });
  $("#apex_showHideTargetTypes input").checkboxradio(
      {icon:false}
  );
  $("#apex_showHideTargetTypes input").change(function(){
    this.blur();
  });
  $("#apex_showHideTargetTypes input").click(function(){
    var thisId = $(this).attr("id");
    if (thisId === "useLowProfileTarget" && use_fortified_calculations == true) {
      $(this).parent().children().prop("checked", false).change();
      $(this).prop("checked", true).change();
    } else if (thisId === "useFortifiedTarget" && use_lowprofile_calculations == true) {
      $(this).parent().children().prop("checked", false).change();
      $(this).prop("checked", true).change();
    } else if (thisId === "useFortifiedTarget" && use_fortified_calculations == true) {
      $(this).parent().children().prop("checked", false).change();
      $(this).prop("checked", false).change();
    } else if (thisId === "useLowProfileTarget" && use_lowprofile_calculations == true) {
      $(this).parent().children().prop("checked", false).change();
      $(this).prop("checked", false).change();
    }
    this.blur();
    updateGraphsForTargetType();
  });
  $("#apex_showHideHeadShots input").checkboxradio(
      {icon:false}
  );
  $("#apex_showHideHeadShots input").change(function(){
    this.blur();
  });
  $("#apex_showHideHeadShots input").click(function(){
    var thisId = $(this).attr("id");
    if (thisId === "useLimbShotDamage" && use_headshot_calculations == true) {
      $(this).parent().children().prop("checked", false).change();
      $(this).prop("checked", true).change();
    } else if (thisId === "useHeadShotDamage" && use_ls_multi_calculations == true) {
      $(this).parent().children().prop("checked", false).change();
      $(this).prop("checked", true).change();
    } else if (thisId === "useHeadShotDamage" && use_headshot_calculations == true) {
      $(this).parent().children().prop("checked", false).change();
      $(this).prop("checked", false).change();
    } else if (thisId === "useLimbShotDamage" && use_ls_multi_calculations == true) {
      $(this).parent().children().prop("checked", false).change();
      $(this).prop("checked", false).change();
    }
    this.blur();
    updateGraphsForHeadShots();
  });

  APEXgenerateAPEXCustomizationsArray();
  $('#selectors > select').addClass('apex_comp-selectors').wrap("<div class='apex_comp-selectorContainer'></div>")
}

function updateGraphsForHeadShots(){
  if ($("#useHeadShotDamage").is(":checked")){
    use_headshot_calculations = true;
    use_ls_multi_calculations = false;
  } else if ($("#useLimbShotDamage").is(":checked")){
    use_headshot_calculations = false;
    use_ls_multi_calculations = true;
  } else {
    use_headshot_calculations = false;
    use_ls_multi_calculations = false;
  }
  APEXUpdateFromToolBar();
}

/*
  Creates an array used to generate the spec/customization buttons.  Each entry
  is an array of 4 objects that represent the 4 spec tiers. 'a' is left side,
  'b' is right side.  Each entry also has a weaponName variable There is one
  entry per weapon.
*/
function APEXgenerateAPEXCustomizationsArray () {
    $.each(APEXWeaponData, function (key, weapon) {
      var weaponIndex = apex_getIndexOfWeapon(weapon.WeaponData.printname, APEXCustomizationsArray);
      if (weaponIndex < 0) {
        var newWeaponEntry = {};
        newWeaponEntry.weaponName = weapon.WeaponData.printname;
        newWeaponEntry.customizations = [{a:"",b:""}, {a:"",b:""}, {a:"",b:""}, {a:"",b:""}];
        weaponIndex = APEXCustomizationsArray.push(newWeaponEntry) - 1
      }

      // if (weapon.Attachments_short.length > 0){
      //   var short_attachments = weapon.Attachments_short.split('+')
      //   for (var i = 0; i < short_attachments.length; i++) {
      //     if ((APEXCustomizationsArray[weaponIndex].customizations[i].a.localeCompare(short_attachments[i]) !== 0) && (APEXCustomizationsArray[weaponIndex].customizations[i].b.localeCompare(short_attachments[i]) != 0)){
      //       if (APEXCustomizationsArray[weaponIndex].customizations[i].a.length === 0) {
      //         APEXCustomizationsArray[weaponIndex].customizations[i].a = short_attachments[i]
      //       } else {
      //         APEXCustomizationsArray[weaponIndex].customizations[i].b = short_attachments[i]
      //       }
      //     }
      //   }
      // }
    })
}

/*
    Search the array for the entry with the given weapon name and return
    the index for it or '-1' if not found.
*/
function apex_getIndexOfWeapon (weapon, customizationArray) {
  var weaponIndex = -1;
  for (var i = 0; i < customizationArray.length; i++) {
    if (customizationArray[i].weaponName === weapon) {
      weaponIndex = i;
      break  // I hate breaks but this increases performance
    }
  }
  return weaponIndex
}

/*
  Create the html for the customization buttons for the selected weapon
*/
function printAPEXCustomizationButtons (e){
  var selectedSelect = ($(e.target).find('option:selected'));
  var selectedOption = ($(e.target).find('option:selected').text().trim());


  if(selectedOption.localeCompare(SELECT_OPTION_1_TEXT) !== 0){
    $(selectedSelect).parent().siblings('div').remove();
    $(selectedSelect).parent().after(apex_compPrintCustomizations(selectedOption));
    $(selectedSelect).parent().parent().find('input').checkboxradio(
      {icon: false }
    );
    apex_compInitializeCustomizationButtons($(selectedSelect).parent().parent().find('.customButton'))
  }

}

/*
  Generates the html used for the customization buttons
*/
function apex_compPrintCustomizations (weaponName) {
  var custString = '';
  var weaponIndex = apex_getIndexOfWeapon(weaponName, APEXCustomizationsArray);
  var weaponCust = APEXCustomizationsArray[weaponIndex].customizations;

  if (weaponCust[0].a !== '') {
    for (var i = 0; i < weaponCust.length; i++) {
      var rowClass = 'custRow' + i.toString();
      custString += '<div>';
      custString += "<input id='" + APEXAddVariantCounter + weaponName + weaponCust[i].a + i.toString() + "' name='" + APEXAddVariantCounter + weaponName + i.toString() + "' type='radio' class='customButton " + rowClass + " custCol1'><label data-shortname='" + weaponCust[i].a + "' for='" + APEXAddVariantCounter + weaponName + weaponCust[i].a + i.toString() + "'>" + APEXCustomizationStrings[weaponCust[i].a] + '</label>';
      custString += "<input id='" + APEXAddVariantCounter + weaponName + weaponCust[i].b + i.toString() + "' name='" + APEXAddVariantCounter + weaponName + i.toString() + "' type='radio' class='customButton " + rowClass + " custCol2'><label data-shortname='" + weaponCust[i].b + "' for='" + APEXAddVariantCounter + weaponName + weaponCust[i].b + i.toString() + "'>" + APEXCustomizationStrings[weaponCust[i].b] + '</label>';
      custString += '</div>'
    }
  }
  APEXAddVariantCounter++;

  return custString
}

/*
  Creates event handlers for the customization buttons so that users are only
  allowed to click on the appropriate ones. i.e. only click 2nd tier button if
  a 1st tier button has been selected.
*/
function apex_compInitializeCustomizationButtons (buttonObj) {
    $(buttonObj).change(function () {
      if ($(this).is(':checked') || $(this).siblings('.customButton').is(':checked')) {
        if ($(this).hasClass('custRow1')) {
          var thisCol = $(this).hasClass('custCol1') ? '.custCol1' : '.custCol2';
          $(this).parent().next().children(thisCol).checkboxradio('enable')
        } else {
          $(this).parent().next().children('.customButton').checkboxradio('enable')
        }
      }
    });

    $(buttonObj).click(function () {
      if ($(this).hasClass('custRow1')) {
        $(this).parent().nextAll().children('.customButton').prop('checked', false).change();
        $(this).parent().nextAll().children('.customButton').checkboxradio('disable')
      }

      var thisId = $(this).attr('id');
      if ($(this).siblings("label[for='" + thisId + "']").hasClass('ui-state-active')) {
        $(this).prop('checked', false).change();
        $(this).parent().nextAll().children('.customButton').prop('checked', false).change();
        $(this).parent().nextAll().children('.customButton').checkboxradio('disable')
      }

      this.blur();
      var selectedAttachments = $(this).parentsUntil('.tbody', 'tr').find('td.firstColumn > .lblWeaponName').text();
      $(this).parent().parent().find('.customButton').each(function () {
        if ($(this).is(':checked')) {
          selectedAttachments += $(this).next('label').data('shortname')
        }
      });

      var selectedWeapons = APEXGetSelectedWeapons();

      // Get filters for updating the table.
      var filters = $('#column_filter')[0].value.toLowerCase();
      var includeOnlyDiffering = $('#column_onlydiffering')[0].checked;
      filters = filters.split(',');

      APEXUpdateTable(selectedWeapons, filters, includeOnlyDiffering);
      APEXUpdateDamageGraph(selectedWeapons);
      APEXUpdateTTKAndBTKGraphs(selectedWeapons)
    });

    $(buttonObj).parent().parent().find('div:not(:nth-child(2)) .customButton').checkboxradio('disable')
}

function showHideGraphs(){
  if ($("#showNormalBTKCheck").is(":checked")){
    $("#damage_graph").show(0);
    $("#btkub_graph").show(0);
  } else {
    $("#btkub_graph").hide(0);
  }
  if ($("#showNormalTTKCheck").is(":checked")){
    $("#ttkub_graph").show(0);
    $("#btkub_graph").show(0);
  } else {
    $("#ttkub_graph").hide(0);
    $("#btkub_graph").hide(0);
  }
  //
  if ($("#showWhiteBTKCheck").is(":checked")){
    $("#white_btkub_graph").show(0);
  } else {
    $("#white_btkub_graph").hide(0);
  }
  if ($("#showWhiteTTKCheck").is(":checked")){
    $("#white_btkub_graph").show(0);
    $("#white_ttkub_graph").show(0);
  } else {
    $("#white_btkub_graph").hide(0);
    $("#white_ttkub_graph").hide(0);
  }
  //
  if ($("#showBlueBTKCheck").is(":checked")){
    $("#blue_btkub_graph").show(0);
  } else {
    $("#blue_btkub_graph").hide(0);
  }
  if ($("#showBlueTTKCheck").is(":checked")){
    $("#blue_ttkub_graph").show(0);
    $("#blue_btkub_graph").show(0);
  } else {
    $("#blue_btkub_graph").hide(0);
    $("#blue_ttkub_graph").hide(0);
  }
  //
  if ($("#showPurpleBTKCheck").is(":checked")){
    $("#purple_btkub_graph").show(0);
  } else {
    $("#purple_btkub_graph").hide(0);
  }
  if ($("#showPurpleTTKCheck").is(":checked")){
    $("#purple_ttkub_graph").show(0);
    $("#purple_btkub_graph").show(0);
  } else {
    $("#purple_btkub_graph").hide(0);
    $("#purple_ttkub_graph").hide(0);
  }
  //
}

function updateGraphsForTargetType(){
  if ($("#useFortifiedTarget").is(":checked")){
    use_fortified_calculations = true;
    use_lowprofile_calculations = false;
  } else if ($("#useLowProfileTarget").is(":checked")){
    use_fortified_calculations = false;
    use_lowprofile_calculations = true;
  } else {
    use_fortified_calculations = false;
    use_lowprofile_calculations = false;
  }
  APEXUpdateFromToolBar();
}

