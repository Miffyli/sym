// Logic behind comparison pages

// Text for the "no weapon selected" box
const BF3_SELECT_OPTION_0_TEXT = 'Select Weapon...'

// Color codes for the best/worst value
const BF3_NEUTRAL_VALUE_COLOR = [255, 255, 255]
const BF3_BEST_VALUE_COLOR = [0, 255, 0]
const BF3_WORST_VALUE_COLOR = [255, 0, 0]


/*
  Return list of select weapons (the
  full directory), according to
  select weapon names and attachments.
*/
function BF3GetSelectedWeapons () {
  var selectedWeapons = []

  $('.bf3-comp-selectorContainer').each(function () {
    if ($(this).find('select')[0].selectedIndex !== 0) {
      var selectedWeapName = $(this).find('select option:selected').text().trim()

      var weaponStats = BF3WeaponData.find(function (weapon) {
        return weapon.WeapShowName === selectedWeapName
      })
      selectedWeapons.push(weaponStats)
    }
  })
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
function BF3FilterTable (variableName, weaponValues, filters, includeOnlyDiffering) {
  var shouldInclude = true

  // Hardcoded: Only include numeric values in the table (including "N/A")
  // TODO this should be done before-hand
  shouldInclude = weaponValues.every(weaponValue => (!isNaN(weaponValue) || weaponValue === 'N/A'))

  // If we have keywords, check if we match them
  if (filters.length > 0) {
    // Check if variableName is among filters
    var lowercaseVariableName = variableName.toLowerCase()
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
function BF3ColorVariables(variableName, weaponValues) {
  var colorCodes

  if (weaponValues.length == 1 || weaponValues.some(weaponValue => isNaN(weaponValue))) {
    // Only one item in the list or there are non-numeric values
    // -> Return neutral color
    colorCodes = weaponValues.map(weaponValue => BF3_NEUTRAL_VALUE_COLOR)
  } else {
    // Get unique values
    var uniqueValues = Array.from(new Set(weaponValues))
    // If we only have , do not bother with coloring
    if (uniqueValues.length === 1) {
      colorCodes = weaponValues.map(weaponValue => BF3_NEUTRAL_VALUE_COLOR)
    } else {
      // Sort by value so that "lower is worse".
      uniqueValues.sort((a, b) => a - b)

      // Values are now "higher is better".
      // If variable is not in BF3_LOWER_IS_WORSE, then
      // reverse the list
      if (!BF3_LOWER_IS_WORSE.has(variableName)) {
        uniqueValues.reverse()
      }

      colorCodes = []
      // Lower rank in uniqueValues -> worse value
      for (var i = 0; i < weaponValues.length; i++) {
        // -1 so that final value (best) has BF3_BEST_VALUE_COLOR
        var rankRatio = uniqueValues.indexOf(weaponValues[i]) / (uniqueValues.length - 1)
        colorCodes.push(
          BF3InterpolateRGB(BF3_WORST_VALUE_COLOR, BF3_BEST_VALUE_COLOR, rankRatio)
        )
      }
    }
  }
  // Turn RGB arrays to html color code
  colorCodes = colorCodes.map(colorCode => BF3ArrayToRGB(colorCode))
  return colorCodes
}

/*
  Update weapon table (i.e. create from scratch)
  with currently selected weapons and filters.
  Takes in a list of selected weapons, filter keywords (list)
  and boolean if only differing values should be included.
*/
function BF3UpdateTable (selectedWeapons, filters, includeOnlyDiffering) {
  if (selectedWeapons.length > 0) {
    // Construct table as a HTML string we append later
    // to correct table. Hopefully this is fast enough.
    // Start with headers
    var tableHtml = '<table><tr><th></th>'
    for (var i = 0; i < selectedWeapons.length; i++) {
      // Also add weapon name to table headers
      tableHtml += '<th>' + selectedWeapons[i]['WeapShowName'] + '</th>'
    }
    tableHtml += '</tr>'

    // Now for each row, show variable name and numbers
    for (var variableIndex = 0; variableIndex < BF3WeaponKeys.length; variableIndex++) {
      // Check filtering: Get variable name and the values, check if want
      // to include that variable and then include it
      var variableKey = BF3WeaponKeys[variableIndex]
      // Not all variables exist for all weapons, so replace those with "N/A"
      var weaponVariables = selectedWeapons.map(weapon => weapon[variableKey] || 'N/A')

      if (BF3FilterTable(variableKey, weaponVariables, filters, includeOnlyDiffering) === true) {
        // Get coloring of the items
        var variableColoring = BF3ColorVariables(variableKey, weaponVariables)
        // Begin row and add variable name
        tableHtml += '<tr><td>' + variableKey + '</td>'
        for (var weaponIndex = 0; weaponIndex < weaponVariables.length; weaponIndex++) {
          tableHtml += `<td style="color: ${variableColoring[weaponIndex]}"> ${weaponVariables[weaponIndex]} </td>`
        }
        tableHtml += '</tr>'
      }
    }
    tableHtml += '</table>'

    // Place table to its location
    $('#compare_table').html(tableHtml)
  }
}

/*
  Update damage graph with the selected weapons.
  Takes in a list of selected weapons.
*/
function BF3UpdateDamageGraph (selectedWeapons) {
  var serieses = []
  for (var i = 0; i < selectedWeapons.length; i++) {
    var weapon = selectedWeapons[i]
    serieses.push({
      name: weapon['WeapShowName'],
      data: BF3GetDamageOverDistance(weapon)
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
      valueDecimals: 3
    },

    plotOptions: {
      line: {
        marker: {
          enabled: false
        }
      }
    },

    series: serieses
  })
}

/*
  Update BTK and TTK graphs according to selected weapons.
  Takes in a list of selected weapons.
*/
function BF3UpdateTTKAndBTKGraphs (selectedWeapons) {
  var btkSerieses = []
  var ttkSerieses = []
  for (var i = 0; i < selectedWeapons.length; i++) {
    var weapon = selectedWeapons[i]
    btkSerieses.push({
      name: weapon['WeapShowName'],
      data: BF3GetBTKUpperBoundOverDistance(weapon)
    })
    ttkSerieses.push({
      name: weapon['WeapShowName'],
      data: BF3GetTTKUpperBoundOverDistance(weapon)
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
      shared: true
    },

    plotOptions: {
      line: {
        marker: {
          enabled: false
        }
      }
    },

    series: btkSerieses
  })

  Highcharts.chart('ttkub_graph', {
    title: {
      text: 'Time-to-kill upper bound'
    },

    subtitle: {
      text: 'Based on "RoF". Assumes all shots/pellets hit. Includes bullet velocity. Includes multipliers.'
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
      valueDecimals: 3
    },

    plotOptions: {
      line: {
        marker: {
          enabled: false
        }
      }
    },

    series: ttkSerieses
  })
}

/*
  Callback function for when filters change
  (only redo table, not graphs).
*/
function BF3FilterOnChange () {
  var selectedWeapons = BF3GetSelectedWeapons()

  var filters = $('#column_filter')[0].value.toLowerCase()
  var includeOnlyDiffering = $('#column_onlydiffering')[0].checked
  filters = filters.split(',')

  BF3UpdateTable(selectedWeapons, filters, includeOnlyDiffering)
}

/*
  Callback function for when one of the UI selectors changes
  (different weapon, different attachments, different
  filters)
*/
function BF3SelectorsOnChange (e) {
  BF3updateSelectors()
  var selectedWeapons = BF3GetSelectedWeapons()

  // Get filters for updating the table.
  var filters = $('#column_filter')[0].value.toLowerCase()
  var includeOnlyDiffering = $('#column_onlydiffering')[0].checked
  filters = filters.split(',')

  BF3UpdateTable(selectedWeapons, filters, includeOnlyDiffering)
  BF3UpdateDamageGraph(selectedWeapons)
  BF3UpdateTTKAndBTKGraphs(selectedWeapons)
}

/*
  Check correct number of selectors
  and if one of them should be removed
*/
function BF3updateSelectors () {
  $('.bf3-comp-selectorContainer > select').each(function() {
    if (this.selectedIndex === 0 && $('.bf3-comp-selectorContainer > select').length > 1) {
      $(this).parent().remove()
    }
  })

  var emptySelects = 0
  $('.bf3-comp-selectorContainer > select').each(function() {
    if (this.selectedIndex === 0) {
      emptySelects++
    }
  })

  if (emptySelects <= 1 && $('.bf3-comp-selectorContainer').length < 6) {
    $('.bf3-comp-selectorContainer').last().after($('.bf3-comp-selectorContainer').first().clone(true))
    $('.bf3-comp-selectorContainer').last().children('div').remove()
    $('.bf3-comp-selectorContainer').last().children('select').change(function (e) {
      BF3SelectorsOnChange(e)
    })
  }
}

/*
  Entrypoint for the comparison page.
  Note: This should called after all data has been loaded!
*/
function initializeBF3Comparison () {
  var selectorParent = $('#selectors')[0]

  // Create different options (i.e. weapons)
  // and add them to first selector
  var firstSelector = document.createElement('select')
  firstSelector.onchange = BF3SelectorsOnChange
  // First add empty option
  var option = document.createElement('option')
  option.text = BF3_SELECT_OPTION_0_TEXT
  firstSelector.add(option)
  var weaponNames = BF3WeaponData.map(
    weapon => weapon['WeapShowName']
  )
  weaponNames.sort()
  for (var i = 0; i < weaponNames.length; i++) {
    option = document.createElement('option')
    option.text = weaponNames[i]
    firstSelector.add(option)
  }
  // Start with two empty choices already
  // (reminds people of it being a comparison)
  selectorParent.appendChild(firstSelector)


  // Set oninput for filter elements
  document.getElementById('column_filter').oninput = BF3FilterOnChange
  document.getElementById('column_onlydiffering').onclick = BF3FilterOnChange

  $('#selectors > select').addClass('comp-selectors').wrap("<div class='bf3-comp-selectorContainer'></div>")
  BF3updateSelectors()
}
