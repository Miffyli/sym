// Logic behind comparison pages
let oHandler0a;
let oHandler1a;// this will be assign in on ready below
let oHandler2a;
let oHandler3a;
let oHandler4a;
//bool for using HS/Limp multi
// let use_hs_multi_calculations = false;
let use_ls_multi_calculations = false;
let use_low_profile_calculations = false;
let use_fortified_calculations = false;
let show_ttk_chart = false;
let show_btk_chart = false;
// Text for the "no weapon selected" box
const SELECT_OPTION_1_TEXT = 'Select Weapon...';

// Color codes for the best/worst value
const APEX_NEUTRAL_VALUE_COLOR = [255, 255, 255];
const APEX_BEST_VALUE_COLOR = [0, 255, 0];
const APEX_WORST_VALUE_COLOR = [255, 0, 0];

// Array used to generate apex_attachments buttons for each weapon
// The array is generated in a function below
const APEXCustomizationsArray = [];
let active_comparison_weapon_attachments = [];
// Used to prepend to id of customization buttons to make them all unique
// in order to accommodate multiple instances of the same weapon.
let APEXAddVariantCounter = 0;

let use_headshot_calculations = false;
let helm_multi = 1.0;
let use_amped_calculations = false;

let use_charge_spinup_time_calculations = true;
/*
  Return true if given variable should be included in the
  datatable, false otherwise.
  variableName: Name of the variable
  weaponValues: List of values of variableName from different weapons
  filters: List of filter keywords
  includeOnlyDiffering: If false, only include variables where weapons differ
*/
function APEXFilterTable (variableName, weaponValues, filters, includeOnlyDiffering) {
  let shouldInclude;

  // Hardcoded: Only include numeric values in the table (including "N/A")
  // Apex Weapons do not have a shared set of values for weapons. Leaving many values to be left out here.
  // For now valid values with no matching value to compare against is denoted as -1
  // TODO: change how data is parsed before being used on the site and add missing/unused keys with default values
  //  to every weapon on the data parsing side.
  // TODO: Filter out unnecessary , unused, and troublesome keys on the data parsing side.

  shouldInclude = weaponValues.every(weaponValue => (!isNaN(weaponValue) || weaponValue === 'N/A'));

  if(shouldInclude === false){
    shouldInclude = weaponValues.some(weaponValue => (Number.isFinite(parseFloat(weaponValue))) && !Array.isArray(weaponValue));
    if (shouldInclude){
      for (let i = 0; i < weaponValues.length; i++) {
        if(weaponValues[i] === "" || weaponValues[i] === undefined){
          weaponValues[i] = " - ";
        }
      }
    }
  }

  // If we have keywords, check if we match them
  if (filters.length > 0) {
    // Check if variableName is among filters
    const lowercaseVariableName = variableName.toLowerCase();
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
  let colorCodes;

  if (weaponValues.length === 1 || weaponValues.some(weaponValue => isNaN(weaponValue))) {
    // Only one item in the list or there are non-numeric values
    // -> Return neutral color
    // noinspection JSUnusedLocalSymbols
    colorCodes = weaponValues.map(weaponValue => APEX_NEUTRAL_VALUE_COLOR)
  } else {
    //Until source data has
    let fake_value = weaponValues.find( function (el) {
      return el !== -1;
    });
    let replacement_weaponValues = [];
    for (let i = 0; i < weaponValues.length; i++) {
      if(weaponValues[i] === "" || weaponValues[i] === undefined || weaponValues[i] === -1) {
        replacement_weaponValues.push(fake_value);
        weaponValues[i] = " - "
      } else {
        replacement_weaponValues.push(weaponValues[i]);
      }
    }
    // Get unique values
    const uniqueValues = Array.from(new Set(replacement_weaponValues));
    // If we only have , do not bother with coloring
    if (uniqueValues.length === 1) {
      // noinspection JSUnusedLocalSymbols
      colorCodes = weaponValues.map(weaponValue => APEX_NEUTRAL_VALUE_COLOR)
    } else {
      // Sort by value so that "lower is worse".
      // uniqueValues.sort();
      uniqueValues.sort((a, b) => a - b);
      if (!APEX_LOWER_IS_WORSE.has(variableName)) {
        uniqueValues.reverse()
      }

      colorCodes = [];
      // Lower rank in uniqueValues -> worse value
      for (let i = 0; i < weaponValues.length; i++) {
        // -1 so that final value (best) has APEX_BEST_VALUE_COLOR
        let rankRatio = uniqueValues.indexOf(replacement_weaponValues[i]) / (uniqueValues.length - 1);
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
    let tableHtml = '<table><tr><th></th>';
    for (let i = 0; i < selectedWeapons.length; i++) {
      // Also add weapon name to table headers
      tableHtml += '<th>' + selectedWeapons[i]['custom_name_short'] + '</th>'
    }
    tableHtml += '</tr>';

    // Now for each row, show variable name and numbers
    for (let variableIndex = 0; variableIndex < APEXWeaponKeys.length; variableIndex++) {
      // Check filtering: Get variable name and the values, check if want
      // to include that variable and then include it
      const variableKey = APEXWeaponKeys[variableIndex];
      const weaponVariables = selectedWeapons.map(weapon => weapon[variableKey]);

      if (APEXFilterTable(variableKey, weaponVariables, filters, includeOnlyDiffering) === true) {
        // Get coloring of the items
        const variableColoring = APEXColorVariables(variableKey, weaponVariables);
        // Begin row and add variable name
        tableHtml += '<tr><td>' + variableKey + '</td>';
        for (let weaponIndex = 0; weaponIndex < weaponVariables.length; weaponIndex++) {
          tableHtml += `<td style="color: ${variableColoring[weaponIndex]}">${weaponVariables[weaponIndex]}</td>`
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
  const series = [];
  for (let i = 0; i < selectedWeapons.length; i++) {
    const weapon = selectedWeapons[i];
    series.push({
      name: apex_weapon_name_dict[weapon['printname']] + " #"+i,
      data: APEXGetDamageOverDistance(weapon)
    })
  }

  // noinspection JSUnresolvedVariable
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
  //Create an object that contains all of the selected weapons BTKs and TTKs.
  populateBTTKData(selectedWeapons);

  const btk_series = [];
  const btk_white_series = [];
  const btk_blue_series = [];
  const btk_purple_series = [];
  const btk_red_series = [];
  const btk_combo_series = [];
  const ttk_series = [];
  const ttk_white_series = [];
  const ttk_blue_series = [];
  const ttk_purple_series = [];
  const ttk_red_series = [];
  const ttk_combo_series = [];
  for (let i = 0; i < selectedWeapons.length; i++) {
    const weapon = selectedWeapons[i];
    btk_white_series.push({
      name: apex_weapon_name_dict[weapon['printname']] + " #"+i,
      data: APEXWeaponBTTKData[apex_weapon_name_dict[weapon['printname']]+ " #"+i].White[0].BTTK.BTK
    });
    ttk_white_series.push({
      name: apex_weapon_name_dict[weapon['printname']] + " #"+i,
      data: APEXWeaponBTTKData[apex_weapon_name_dict[weapon['printname']]+ " #"+i].White[0].BTTK.TTK
    });
    btk_blue_series.push({
      name: apex_weapon_name_dict[weapon['printname']] + " #"+i,
      data: APEXWeaponBTTKData[apex_weapon_name_dict[weapon['printname']]+ " #"+i].Blue[0].BTTK.BTK
    });
    ttk_blue_series.push({
      name: apex_weapon_name_dict[weapon['printname']] + " #"+i,
      data: APEXWeaponBTTKData[apex_weapon_name_dict[weapon['printname']]+ " #"+i].Blue[0].BTTK.TTK
    });
    btk_purple_series.push({
      name: apex_weapon_name_dict[weapon['printname']] + " #"+i,
      data: APEXWeaponBTTKData[apex_weapon_name_dict[weapon['printname']]+ " #"+i].Purple[0].BTTK.BTK
    });
    ttk_purple_series.push({
      name: apex_weapon_name_dict[weapon['printname']] + " #"+i,
      data: APEXWeaponBTTKData[apex_weapon_name_dict[weapon['printname']]+ " #"+i].Purple[0].BTTK.TTK
    });
    btk_red_series.push({
      name: apex_weapon_name_dict[weapon['printname']] + " #"+i,
      data: APEXWeaponBTTKData[apex_weapon_name_dict[weapon['printname']]+ " #"+i].Red[0].BTTK.BTK
    });
    ttk_red_series.push({
      name: apex_weapon_name_dict[weapon['printname']] + " #"+i,
      data: APEXWeaponBTTKData[apex_weapon_name_dict[weapon['printname']]+ " #"+i].Red[0].BTTK.TTK
    });
    btk_series.push({
      name: apex_weapon_name_dict[weapon['printname']] + " #"+i,
      data: APEXWeaponBTTKData[apex_weapon_name_dict[weapon['printname']]+ " #"+i].None[0].BTTK.BTK
    });
    ttk_series.push({
      name: apex_weapon_name_dict[weapon['printname']] + " #"+i,
      data: APEXWeaponBTTKData[apex_weapon_name_dict[weapon['printname']]+ " #"+i].None[0].BTTK.TTK
    });
  }

  // noinspection JSUnresolvedVariable
  Highcharts.chart('btk_ub_graph', {
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
  // noinspection JSUnresolvedVariable
  Highcharts.chart('ttk_ub_graph', {
    chart: {
      zoomType: 'x'
    },
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

  // noinspection JSUnresolvedVariable
  Highcharts.chart('white_btk_ub_graph', {
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
  // noinspection JSUnresolvedVariable
  Highcharts.chart('white_ttk_ub_graph', {
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

  // noinspection JSUnresolvedVariable
  Highcharts.chart('blue_btk_ub_graph', {
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
  // noinspection JSUnresolvedVariable
  Highcharts.chart('blue_ttk_ub_graph', {
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

  // noinspection JSUnresolvedVariable
  Highcharts.chart('purple_btk_ub_graph', {
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
  // noinspection JSUnresolvedVariable
  Highcharts.chart('purple_ttk_ub_graph', {
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
  });
  // noinspection JSUnresolvedVariable
  Highcharts.chart('red_btk_ub_graph', {
    title: {
      text: 'Bullets-to-kill /w Red Shield'
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

    series: btk_red_series
  });
  // noinspection JSUnresolvedVariable
  Highcharts.chart('red_ttk_ub_graph', {
    title: {
      text: 'Time-to-kill w/ Red Shield'
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

    series: ttk_red_series
  });
  // noinspection JSUnresolvedVariable
  Highcharts.chart('combo_btk_ub_graph', {
    title: {
      text: 'Bullets-to-kill /w Combo Shield'
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

    series: btk_combo_series
  });
  // noinspection JSUnresolvedVariable
  Highcharts.chart('combo_ttk_ub_graph', {
    title: {
      text: 'Time-to-kill w/ Combo Shield'
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

    series: ttk_combo_series
  })
}

/*
  Callback function for when filters change
  (only redo table, not graphs).
*/
function APEXFilterOnChange () {
  const selectedWeapons = apex_ComparisonGetSelectedWeapons();

  let filters = $('#column_filter')[0].value.toLowerCase();
  const includeOnlyDiffering = $('#column_onlydiffering')[0].checked;
  filters = filters.split(',');

  APEXUpdateTable(selectedWeapons, filters, includeOnlyDiffering)
}

function APEXUpdateFromToolBar(){
  const selectedWeapons = apex_ComparisonGetSelectedWeapons();

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
  let e_selected = ($(e.target).find('option:selected').text().trim());
  apex_updateSelectors();
  // printAPEXCustomizationButtons(e);
  const selectedWeapons = apex_ComparisonGetSelectedWeapons();
  apex_printComparisonAttachmentButtons(e);

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
  // noinspection JSJQueryEfficiency
  $('.apex_comp-selectorContainer > select');
  // noinspection JSJQueryEfficiency
  $('.apex_comp-selectorContainer > select').each(function() {
    if (this.selectedIndex === 0 && $('.apex_comp-selectorContainer > select').length > 1) {
      $(this).parent().remove()
    }
  });

  let emptySelects = 0;
  // noinspection JSJQueryEfficiency
  $('.apex_comp-selectorContainer > select').each(function() {
    if (this.selectedIndex === 0) {
      emptySelects++
    }
  });
  // noinspection JSJQueryEfficiency
  if (emptySelects === 0 && $('.apex_comp-selectorContainer').length < 26) {
    // noinspection JSJQueryEfficiency
    $('.apex_comp-selectorContainer').last().after($('.apex_comp-selectorContainer').first().clone(true));
    // noinspection JSJQueryEfficiency
    $('.apex_comp-selectorContainer').last().children('div').remove();
    // noinspection JSJQueryEfficiency
    $('.apex_comp-selectorContainer').last().children('select').change(function (e) {
      APEXSelectorsOnChange(e)
    })
  }
}

/*
  Entry point for the comparison page.
  Note: This should called after all data has been loaded!
*/
function initializeAPEXComparison () {
  active_comparison_weapon_attachments = [];
  const selectorParent = $('#selectors')[0];

  // TODO Create proper selectors
  //      (one for weapon and another for attachments)
  //      (Fill in possible weapons etc)

  // Create different options (i.e. weapons)
  // and add them to first selector
  const firstSelector = document.createElement('select');
  firstSelector.onchange = APEXSelectorsOnChange;
  // First add empty option
  let option = document.createElement('option');
  option.text = SELECT_OPTION_1_TEXT;
  firstSelector.add(option);

  const weaponNames = APEXWeaponData.filter(
      weapon => weapon["WeaponData"]["weapon_type_flags"] === "WPT_PRIMARY"
  ).map(
      weapon => weapon["WeaponData"]["printname"]
  );
  // weaponNames.sort();
  for (let i = 0; i < weaponNames.length; i++) {
    option = document.createElement('option');
  option.text = apex_weapon_name_dict[weaponNames[i]];
  firstSelector.add(option)
}
  selectorParent.appendChild(firstSelector);

  // Set oninput for filter elements
  document.getElementById('column_filter').oninput = APEXFilterOnChange;
  document.getElementById('column_onlydiffering').onclick = APEXFilterOnChange;

  apex_updateSelectors();

  let apex_showHideShieldTypes_input = $("#apex_showHideShieldTypes input");
  apex_showHideShieldTypes_input.checkboxradio(
      {icon:false}
  );
  apex_showHideShieldTypes_input.change(function(){
    this.blur();
    showHideGraphs(this);
  });

  //Show / Hide for using Helm
  let apex_showHideHelmTypes_input = $("#apex_showHideHelmTypes input");
  apex_showHideHelmTypes_input.checkboxradio(
      {icon:false}
  );
  apex_showHideHelmTypes_input.change(function(){
    this.blur();
  });
  apex_showHideHelmTypes_input.click(function(){
    // const thisHelmId = $(this).attr("id");
    helm_multi = 1.00;
    if ($("#showNoHelmTTKCheck").is(":checked")){
      // noinspection JSValidateTypes
      $(this).parent().children().prop("checked", false).change();
      $(this).prop("checked", true).change();
      helm_multi = 1.0;
    }
    if ($("#showWhiteHelmTTKCheck").is(":checked")){
      // noinspection JSValidateTypes
      $(this).parent().children().prop("checked", false).change();
      $(this).prop("checked", true).change();
      helm_multi = 0.9;
    }
    if ($("#showBlueHelmTTKCheck").is(":checked")){
      // noinspection JSValidateTypes
      $(this).parent().children().prop("checked", false).change();
      $(this).prop("checked", true).change();
      helm_multi = 0.8;
    }
    if ($("#showPurpleHelmTTKCheck").is(":checked")){
      // noinspection JSValidateTypes
      $(this).parent().children().prop("checked", false).change();
      $(this).prop("checked", true).change();
      helm_multi = 0.75;
    }
    this.blur();
    // console.log("HS Helm Multi ", helm_multi);
    APEXUpdateFromToolBar();
  });

  //Show / Hide Buttons for TTK Charts
  let apex_showHideCharts_input = $("#apex_showHideCharts input");
  apex_showHideCharts_input.checkboxradio(
      {icon:false}
  );
  apex_showHideCharts_input.change(function(){
    this.blur();
  });
  apex_showHideCharts_input.click(function(){
    const thisId = $(this).attr("id");
    if (thisId === "useBTKChart" && show_ttk_chart === true) {
      // noinspection JSValidateTypes
      $(this).parent().children().prop("checked", false).change();
      $(this).prop("checked", true).change();
    } else if (thisId === "useTTKChart" && show_btk_chart === true) {
      // noinspection JSValidateTypes
      $(this).parent().children().prop("checked", false).change();
      $(this).prop("checked", true).change();
    } else if (thisId === "useTTKChart" && show_ttk_chart === true) {
      // noinspection JSValidateTypes
      $(this).parent().children().prop("checked", false).change();
      $(this).prop("checked", false).change();
    } else if (thisId === "useBTKChart" && show_btk_chart === true) {
      // noinspection JSValidateTypes
      $(this).parent().children().prop("checked", false).change();
      $(this).prop("checked", false).change();
    }
    this.blur();
    updateChartsTargetType();
  });
  // Hide the TTK and BTK Chart buttons until the feature if fully implemented.
  $("#apex_showHideCharts").hide();

  let apex_showHideTargetTypes_input = $("#apex_showHideTargetTypes input");
  apex_showHideTargetTypes_input.checkboxradio(
      {icon:false}
  );
  apex_showHideTargetTypes_input.change(function(){
    this.blur();
  });
  apex_showHideTargetTypes_input.click(function(){
    const thisId = $(this).attr("id");
    if (thisId === "useLowProfileTarget" && use_fortified_calculations === true) {
      // noinspection JSValidateTypes
      $(this).parent().children().prop("checked", false).change();
      $(this).prop("checked", true).change();
    } else if (thisId === "useFortifiedTarget" && use_low_profile_calculations === true) {
      // noinspection JSValidateTypes
      $(this).parent().children().prop("checked", false).change();
      $(this).prop("checked", true).change();
    } else if (thisId === "useFortifiedTarget" && use_fortified_calculations === true) {
      // noinspection JSValidateTypes
      $(this).parent().children().prop("checked", false).change();
      $(this).prop("checked", false).change();
    } else if (thisId === "useLowProfileTarget" && use_low_profile_calculations === true) {
      // noinspection JSValidateTypes
      $(this).parent().children().prop("checked", false).change();
      $(this).prop("checked", false).change();
    } else if (thisId === "useAmpedDamage") {
      // noinspection JSValidateTypes
      // $(this).parent().children().prop("checked", false).change();
      if (use_amped_calculations === true) {
        $(this).prop("checked", false).change();
      } else {
        $(this).prop("checked", true).change();
      }
    }
    this.blur();
    updateGraphsForTargetType();
  });

  let apex_showHideHeadShots_input = $("#apex_showHideHeadShots input");
  apex_showHideHeadShots_input.checkboxradio(
      {icon:false}
  );
  apex_showHideHeadShots_input.change(function(){
    this.blur();
  });
  apex_showHideHeadShots_input.click(function(){
    const thisId = $(this).attr("id");
    if (thisId === "useLimbShotDamage") {

      if (use_ls_multi_calculations === true) {
        $("input#useLimbShotDamage").prop("checked", false).change();
      } else {
        $("input#useLimbShotDamage").prop("checked", true).change();
        if (use_headshot_calculations) {
          $("input#useHeadShotDamage").prop("checked", false).change();
        }
      }
    }
    if (thisId === "useHeadShotDamage") {
      if (use_headshot_calculations === true) {
        //turn limb off
        $("input#useHeadShotDamage").prop("checked", false).change();
      } else {
        //turn limb on
        $("input#useHeadShotDamage").prop("checked", true).change();
        // if hs on  turn it off
        if (use_ls_multi_calculations) {
          $("input#useLimbShotDamage").prop("checked", false).change();
        }
      }
    }
      if (thisId === "useAmpedDamage") {
        // noinspection JSValidateTypes
        if (use_amped_calculations === true) {
          $(this).prop("checked", false).change();
        } else {
          $(this).prop("checked", true).change();
        }
      }
    this.blur();
    updateGraphsForHeadShots();
  });

  apex_generateComparisonAttachmentArray();
  $('#selectors > select').addClass('apex_comp-selectors').wrap("<div class='apex_comp-selectorContainer'></div>")
}

function updateGraphsForHeadShots(){
  use_amped_calculations = !!$("#useAmpedDamage").is(":checked");
  // if ($("#useAmpedDamage").is(":checked")) {
  //   use_amped_calculations = true;
  // } else {
  //   use_amped_calculations = false;
  // }
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
    Search the array for the entry with the given weapon name and return
    the index for it or '-1' if not found.
*/
function apex_getIndexOfWeapon (weapon, customizationArray) {
  let weaponIndex = -1;
  for (let i = 0; i < customizationArray.length; i++) {
    if (customizationArray[i].weaponName === weapon) {
      weaponIndex = i;
      break  // I hate breaks but this increases performance
    }
  }
  return weaponIndex
}

function showHideCharts() {
  if ($("#useTTKChart").is(":checked")){
    $("#ttk_chart").show(0);
    apex_printTTKTable()
  } else {
    $("#ttk_chart").hide(0);
  }
}

function showHideGraphs(){
  if ($("#showNormalBTKCheck").is(":checked")){
    $("#damage_graph").show(0);
    $("#btk_ub_graph").show(0);
  } else {
    $("#btk_ub_graph").hide(0);
  }
  if ($("#showNormalTTKCheck").is(":checked")){
    $("#ttk_ub_graph").show(0);
    $("#btk_ub_graph").show(0);
  } else {
    $("#ttk_ub_graph").hide(0);
    $("#btk_ub_graph").hide(0);
  }
  //
  if ($("#showWhiteBTKCheck").is(":checked")){
    $("#white_btk_ub_graph").show(0);
  } else {
    $("#white_btk_ub_graph").hide(0);
  }
  if ($("#showWhiteTTKCheck").is(":checked")){
    $("#white_btk_ub_graph").show(0);
    $("#white_ttk_ub_graph").show(0);
  } else {
    $("#white_btk_ub_graph").hide(0);
    $("#white_ttk_ub_graph").hide(0);
  }
  //
  if ($("#showBlueBTKCheck").is(":checked")){
    $("#blue_btk_ub_graph").show(0);
  } else {
    $("#blue_btk_ub_graph").hide(0);
  }
  if ($("#showBlueTTKCheck").is(":checked")){
    $("#blue_ttk_ub_graph").show(0);
    $("#blue_btk_ub_graph").show(0);
  } else {
    $("#blue_btk_ub_graph").hide(0);
    $("#blue_ttk_ub_graph").hide(0);
  }
  //
  if ($("#showPurpleBTKCheck").is(":checked")){
    $("#purple_btk_ub_graph").show(0);
  } else {
    $("#purple_btk_ub_graph").hide(0);
  }
  if ($("#showPurpleTTKCheck").is(":checked")){
    $("#purple_ttk_ub_graph").show(0);
    $("#purple_btk_ub_graph").show(0);
  } else {
    $("#purple_btk_ub_graph").hide(0);
    $("#purple_ttk_ub_graph").hide(0);
  }
  //
  if ($("#showRedBTKCheck").is(":checked")){
    $("#red_btk_ub_graph").show(0);
  } else {
    $("#red_btk_ub_graph").hide(0);
  }
  if ($("#showRedTTKCheck").is(":checked")){
    $("#red_ttk_ub_graph").show(0);
    $("#red_btk_ub_graph").show(0);
  } else {
    $("#red_btk_ub_graph").hide(0);
    $("#red_ttk_ub_graph").hide(0);
  }
  //
  if ($("#showComboBTKCheck").is(":checked")){
    $("#combo_btk_ub_graph").show(0);
  } else {
    $("#combo_btk_ub_graph").hide(0);
  }
  if ($("#showComboTTKCheck").is(":checked")){
    $("#combo_ttk_ub_graph").show(0);
    $("#combo_btk_ub_graph").show(0);
  } else {
    $("#combo_btk_ub_graph").hide(0);
    $("#combo_ttk_ub_graph").hide(0);
  }
}

function updateGraphsForTargetType(){
  if ($("#useFortifiedTarget").is(":checked")){
    use_fortified_calculations = true;
    use_low_profile_calculations = false;
  } else if ($("#useLowProfileTarget").is(":checked")){
    use_fortified_calculations = false;
    use_low_profile_calculations = true;
  } else {
    use_fortified_calculations = false;
    use_low_profile_calculations = false;
  }
  APEXUpdateFromToolBar();
}

function updateChartsTargetType(){
  if ($("#useTTKChart").is(":checked")){
    show_ttk_chart = true;
    show_btk_chart = false;
  } else if ($("#useBTKChart").is(":checked")){
    show_ttk_chart = false;
    show_btk_chart = true;
  } else {
    show_ttk_chart = false;
    show_btk_chart = false;
  }
  showHideCharts();
}

function apex_printTTKTable(){
  console.log("TTK Charts Not Setup Yet");
}


function apex_comparisonGetUpdatedWeaponData(active_weapon_attachments, weapon_variant_id, weapon_string_name) {
  weapon_variant_id = parseInt(weapon_variant_id);
  let weaponStats;
  // noinspection JSPrimitiveTypeWrapperUsage
  weaponStats = new Object();
  let double_tap_mod_name = null;
  let mod;
  // noinspection JSPrimitiveTypeWrapperUsage
  mod = new Object();
  // APEXLoadWeaponData_orig();
  let APEXWeaponData_Mod;
  APEXWeaponData_Mod = jQuery.extend(true, [], APEXWeaponData_orig);
  let selected_weapon_name = weapon_string_name + "_" + weapon_variant_id;
  for (let i = 0; i < APEXWeaponData.length; i++) {
    if (weapon_string_name === APEXWeaponData_Mod[i]['WeaponData']['printname']) {
        for (const [, value] of Object.entries(active_weapon_attachments[selected_weapon_name])) {
          if (value !== "" && value !== undefined) {
            if (value === 'hopup_highcal_rounds') {
              for (const [mod_key, mod_value] of Object.entries(APEXWeaponData_Mod[i]['WeaponData']['Mods']['altfire_highcal'])) {
                mod[mod_key] = mod_value;
              }
              if (active_weapon_attachments[selected_weapon_name]['slot0'].length > 1) {
                for (const [barrel_mod_key, barrel_mod_value] of Object.entries(APEXWeaponData_Mod[i]['WeaponData']['Mods'][active_weapon_attachments[selected_weapon_name]['slot0']])) {
                  if (barrel_mod_value.toString().includes("*")) {
                    const multi = barrel_mod_value.replace("*", "");
                    mod[barrel_mod_key] = (APEXWeaponData_Mod[i]['WeaponData']['Mods']['altfire_highcal'][barrel_mod_key] * multi).toFixed(3);
                  }
                }
              }
            } else if (value === 'hopup_selectfire') {
              for (const [mod_key, mod_value] of Object.entries(APEXWeaponData_Mod[i]['WeaponData']['Mods']['altfire'])) {
                mod[mod_key] = mod_value;
              }
            } else if (value === 'hopup_double_tap' && !APEXWeaponData_Mod[i]['WeaponData']['printname'].includes("WPN_SHOTGUN")) {
              double_tap_mod_name = "altfire_double_tap";
              for (const [mod_key, mod_value] of Object.entries(APEXWeaponData_Mod[i]['WeaponData']['Mods'][double_tap_mod_name])) {
                mod[mod_key] = mod_value;
              }
            } else {
              for (const [mod_key, mod_value] of Object.entries(APEXWeaponData_Mod[i]['WeaponData']['Mods'][value])) {
                mod[mod_key] = mod_value;
              }
            }
          }
        }
      // Override double tap effective fire rate if also using a shotgun bolt.
      if (APEXWeaponData_Mod[i]['WeaponData']['custom_name_short'].includes("EVA-8 Auto")) {
        mod = apex_updateDoubleTapHopUp(active_weapon_attachments[selected_weapon_name], APEXWeaponData_Mod[i]);
      }
      if (APEXWeaponData_Mod[i]['WeaponData']['custom_name_short'].includes("G7 Scout")) {
        mod = apex_updateDoubleTapHopUp(active_weapon_attachments[selected_weapon_name], APEXWeaponData_Mod[i]);
      }

      // weapon_data = APEXWeaponData_Mod[i]['WeaponData'];
      // let weaponStats = weapon_data;
      for (const [key, value] of Object.entries(mod)) {
        if (!key.includes("effective_fire_rate")) {
          if (!key.includes("viewkick_pattern_data")) {
            if (value.toString().includes("++")) {
              const additive = value.replace("++", "");
              APEXWeaponData_Mod[i]['WeaponData'][key] = (parseInt(APEXWeaponData_Mod[i]['WeaponData'][key]) + parseInt(additive));
            } else if (value.toString().includes("*")) {
              const multi = value.replace("*", "");
              APEXWeaponData_Mod[i]['WeaponData'][key] = (APEXWeaponData_Mod[i]['WeaponData'][key] * multi).toFixed(3);
            } else {
              APEXWeaponData_Mod[i]['WeaponData'][key] = value
            }
          } else {
            if (key.includes("viewkick_pattern_data_")) {
              APEXWeaponData_Mod[i]['WeaponData'][key] = value
            }
          }
        } else {
          APEXWeaponData_Mod[i]['WeaponData'][key] = value
        }
      }

      weaponStats = APEXWeaponData_Mod[i]['WeaponData'];
      // const weaponRow = document.getElementsByClassName(weaponStats['printname'])[(weapon_variant_id)];
      // TODO: Real Recoil - This is just a quick Temp recoil calculation until the values are more ironed out.
      // $(weaponRow).find(".apex_lblMag").text(weaponStats['ammo_clip_size']);
      return weaponStats;
    }
  }
}
/*
  Creates an array used to generate the spec/customization buttons.
*/
function apex_generateComparisonAttachmentArray () {
  $.each(APEXWeaponData, function (key, weapon) {
    let weaponIndex = apex_getIndexOfWeapon(weapon['WeaponData']['printname'], APEXCustomizationsArray);
    if (weaponIndex < 0) {
      const newWeaponEntry = {};
      newWeaponEntry.weaponName = weapon['WeaponData']['printname'];
      newWeaponEntry.customizations = [{a:"",b:""}, {a:"",b:""}, {a:"",b:""}, {a:"",b:""}];
      // noinspection JSUnusedAssignment
      weaponIndex = APEXCustomizationsArray.push(newWeaponEntry) - 1
    }
  })
}

function apex_onCompareAttachmentChange(data) {
  const weapon_comparison_selector_id = data.value.split('_X_')[0];
  let weapon_comparison_string_name = data.value.split('_X_')[1];
  const weapon_comparison_string_attachment = data.value.split('_X_')[3];
  const weapon_comparison_string_slot = data.value.split('_X_')[2];
  const reset_attachments = ["_shotgun_bolt_l0",
    "_barrel_stabilizer_l0",
    "sniper_mag",
    "special_mag",
    "highcal_mag",
    "bullet_mag",
    "optics_iron_sight",
    "shotgun_mag",
    "stock_sniper_l0",
    "stock_tactical_l0",
    "hopup_empty_slot"];
  if (active_comparison_weapon_attachments[weapon_comparison_string_name + "_" + weapon_comparison_selector_id] === undefined) {
    active_comparison_weapon_attachments[weapon_comparison_string_name + "_" + weapon_comparison_selector_id] = [];
    active_comparison_weapon_attachments[weapon_comparison_string_name + "_" + weapon_comparison_selector_id] = {
      slot0: "", slot1: "", slot2: "", slot3: "", slot4: "", slot5: ""
    };
  }
  if(reset_attachments.includes(weapon_comparison_string_attachment)) {
    active_comparison_weapon_attachments[weapon_comparison_string_name+"_"+weapon_comparison_selector_id][weapon_comparison_string_slot] = "";
  } else {
    active_comparison_weapon_attachments[weapon_comparison_string_name+"_"+weapon_comparison_selector_id][weapon_comparison_string_slot] = weapon_comparison_string_attachment;
  }

  let updatedSelectedWeapons = [];
  for (const [key,  ] of Object.entries(active_comparison_weapon_attachments)) {
    let temp_list = {};
    temp_list[key] = active_comparison_weapon_attachments[key];
    let temp_obj = {};
    let weapon_string_name;
    weapon_string_name = key.toString().substring(0, key.toString().length - 2);
    temp_obj =  apex_comparisonGetUpdatedWeaponData(temp_list, key.toString().split("_")[key.toString().split("_").length - 1], weapon_string_name);
    updatedSelectedWeapons.push(temp_obj);
    weapon_comparison_string_name = ""
  }

  // Get filters for updating the table.
  let filters = $('#column_filter')[0].value.toLowerCase();
  const includeOnlyDiffering = $('#column_onlydiffering')[0].checked;
  filters = filters.split(',');

  APEXUpdateTable(updatedSelectedWeapons, filters, includeOnlyDiffering);
  APEXUpdateDamageGraph(updatedSelectedWeapons);
  APEXUpdateTTKAndBTKGraphs(updatedSelectedWeapons)
}

/*
  Create the html for the customization buttons for the selected weapon
*/
function apex_printComparisonAttachmentButtons (e){
  const selectedSelect = ($(e.target).find('option:selected'));
  const selectedOption = ($(e.target).find('option:selected').text().trim());

  if(selectedOption.localeCompare(SELECT_OPTION_1_TEXT) !== 0){
    $(selectedSelect).parent().siblings('div').remove();
    let selection_id = $(selectedSelect).parent().parent().siblings().length;

    $(selectedSelect).parent().after(apex_printComparisonAttachmentHTML(apex_weapon_name_dict[selectedOption], selection_id));
    $(selectedSelect).parent().parent().find('input').checkboxradio(
        {icon: false }
    );
    apex_InitializeComparisonAttachmentButtons(selection_id);
  }

}

/*
  Generates the html used for the customization buttons
*/
function apex_printComparisonAttachmentHTML(weaponName, selection_id) {
  let custString = '';
  const weaponIndex = apex_getIndexOfWeapon(weaponName, APEXCustomizationsArray);
  const weaponCust = APEXWeaponData[weaponIndex]['WeaponData'];

  const attachmentGraphic = (weaponCust['menu_category'] === 8) ? "" : apex_printAttachments([formatWeaponName(weaponCust['printname'])], weaponCust['ammo_pool_type'], true, selection_id);
  custString += '<div>';
  custString += "<div class='apex_customButtonsApex'>" + attachmentGraphic + "</div>";
  custString += '</div>';
  APEXAddVariantCounter++;

  return custString
}

/*
  Creates event handlers for the customization buttons so that users are only
  allowed to click on the appropriate ones. i.e. only click 2nd tier button if
  a 1st tier button has been selected.
*/
function apex_InitializeComparisonAttachmentButtons (selection_id) {
  let weapon_key_string = "";
  // selection_id = str(selection_id);
  $.each(APEXWeaponData, function(key, weapon) {
    weapon_key_string = "#"+selection_id+"_"+ weapon['WeaponData']['printname']+"_barrel_stabilizers";
    oHandler0a = $(weapon_key_string).msDropdown({
      on:{create:function() {},
        change: function(data) {apex_onCompareAttachmentChange(data);
        }}
    }).data("dd");
    weapon_key_string = "#"+selection_id+"_"+ weapon['WeaponData']['printname']+"_extend_mags";
    oHandler1a = $(weapon_key_string).msDropdown({
      on:{create:function() {},
        change: function(data) {apex_onCompareAttachmentChange(data);
        }}
    }).data("dd");
    weapon_key_string = "#"+selection_id+"_"+ weapon['WeaponData']['printname']+"_optics";
    oHandler2a = $(weapon_key_string).msDropdown({
      on:{create:function() {},
        change: function(data) {apex_onCompareAttachmentChange(data);
        }}
    }).data("dd");
    weapon_key_string = "#"+selection_id+"_"+ weapon['WeaponData']['printname']+"_stocks";
    oHandler3a = $(weapon_key_string).msDropdown({
      on:{create:function() {},
        change: function(data) {apex_onCompareAttachmentChange(data);
        }}
    }).data("dd");
    weapon_key_string = "#"+selection_id+"_"+ weapon['WeaponData']['printname']+"_hopups";
    oHandler4a = $(weapon_key_string).msDropdown({
      on:{create:function() {},
        change: function(data) {apex_onCompareAttachmentChange(data);
        }}
    }).data("dd");
  });
}

/*
  Return list of select weapons (the
  full directory), according to
  select weapon names and attachments.
*/
function apex_ComparisonGetSelectedWeapons () {
  const selectedWeapons = [];

  let i = 0;
  $('.apex_comp-selectorContainer').each(function () {
    i += 1;
    if ($(this).find('select')[0].selectedIndex !== 0) {
      const selectedWeaponName = apex_weapon_name_dict[$(this).find('select option:selected').text().trim()];
      let attachments_list_name = selectedWeaponName+"_"+i;
      if (Object.entries(active_comparison_weapon_attachments).length >= 1) {
        for (let [key,  ] of Object.entries(active_comparison_weapon_attachments)) {
          if(key.toString().includes("_"+i)){
            if(active_comparison_weapon_attachments[attachments_list_name] === undefined){
              delete active_comparison_weapon_attachments[key];
              active_comparison_weapon_attachments[attachments_list_name] = {
                slot0: "", slot1: "", slot2: "", slot3: "", slot4: "", slot5: ""
              };
            }
          }
        }
      } else {
        active_comparison_weapon_attachments[attachments_list_name] = [];
        active_comparison_weapon_attachments[attachments_list_name] = {
          slot0: "", slot1: "", slot2: "", slot3: "", slot4: "", slot5: ""
        };
      }
      let temp_list = {};
      let key_str = selectedWeaponName+"_"+i;
      if (active_comparison_weapon_attachments[key_str] === undefined) {
        active_comparison_weapon_attachments[key_str] = [];
        active_comparison_weapon_attachments[key_str] = {
          slot0: "", slot1: "", slot2: "", slot3: "", slot4: "", slot5: ""
        };
      }
      temp_list[key_str] = active_comparison_weapon_attachments[key_str];
      selectedWeapons.push(apex_comparisonGetUpdatedWeaponData(temp_list, i, selectedWeaponName))
    }
  });
  return selectedWeapons
}
