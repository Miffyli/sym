// Logic behind comparison pages

/*
  Return list of WeapShowNames of the
  selected weapons.
  e.g. ['Bren Gun', 'Bren Gun']
*/
function BFVGetSelectedWeaponShowNames () {
  // TODO read html UI elements and
  //      return the WeapShowNames.
  //      For now return placeholder stuff
  return [['Bren Gun'], ['Bren Gun']]
}

/*
  Return list of attachments of the
  selected weapons, in same order as
  getSelectWeaponShowNames.
  e.g. [[], ['Fast_Reload']]
*/
function BFVGetSelectedAttachments () {
  // TODO read html UI elements and
  //      return the attachments.
  //      For now return placeholder stuff
  return [[], ['Fast_Reload']]
}

/*
  Return list of select weapons (the
  full directory), according to
  select weapon names and attachments.
*/
function BFVGetSelectedWeapons () {
  // TODO change this to load data using
  //      BFVGetSelectedWeaponShowNames and
  //      BFVGetSelectedAttachments
  var selectedWeapons = []
  var selectors = $('#selectors')[0].children
  for (var i = 0; i < selectors.length; i++) {
    // First item in the list is empty
    if (selectors[i].selectedIndex !== 0) {
      selectedWeapons.push(BFVWeaponData[selectors[i].selectedIndex - 1])
    }
  }
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
function BFVFilterTable (variableName, weaponValues, filters, includeOnlyDiffering) {
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
  Update weapon table (i.e. create from scratch)
  with currently selected weapons and filters.
  Takes in a list of selected weapons, filter keywords (list)
  and boolean if only differing values should be included.
*/
function BFVUpdateTable (selectedWeapons, filters, includeOnlyDiffering) {
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
    for (var variableIndex = 0; variableIndex < BFVWeaponKeys.length; variableIndex++) {
      // Check filtering: Get variable name and the values, check if want 
      // to include that variable and then include it
      var variableKey = BFVWeaponKeys[variableIndex]
      var weaponVariables = selectedWeapons.map(weapon => weapon[variableKey])

      if (BFVFilterTable(variableKey, weaponVariables, filters, includeOnlyDiffering) === true) {
        // Begin row and add variable name
        tableHtml += '<tr><td>' + variableKey + '</td>'
        for (var weaponIndex = 0; weaponIndex < weaponVariables.length; weaponIndex++) {
          tableHtml += '<td>' + weaponVariables[weaponIndex] + '</td>'
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
function BFVUpdateDamageGraph (selectedWeapons) {
  var serieses = []
  for (var i = 0; i < selectedWeapons.length; i++) {
    var weapon = selectedWeapons[i]
    serieses.push({
      name: weapon['WeapShowName'],
      data: BFVGetDamageOverDistance(weapon)
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
function BFVUpdateTTKAndBTKGraphs (selectedWeapons) {
  var btkSerieses = []
  var ttkSerieses = []
  for (var i = 0; i < selectedWeapons.length; i++) {
    var weapon = selectedWeapons[i]
    btkSerieses.push({
      name: weapon['WeapShowName'],
      data: BFVGetBTKUpperBoundOverDistance(weapon)
    })
    ttkSerieses.push({
      name: weapon['WeapShowName'],
      data: BFVGetTTKUpperBoundOverDistance(weapon)
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
function BFVFilterOnChange () {
  var selectedWeapons = BFVGetSelectedWeapons()

  var filters = $('#column_filter')[0].value.toLowerCase()
  var includeOnlyDiffering = $('#column_onlydiffering')[0].checked
  filters = filters.split(',')

  BFVUpdateTable(selectedWeapons, filters, includeOnlyDiffering)
}

/*
  Callback function for when one of the UI selectors changes
  (different weapon, different attachments, different
  filters)
*/
function BFVSelectorsOnChange () {
  var selectedWeapons = BFVGetSelectedWeapons()
  updateSelectors()

  // Get filters for updating the table.
  var filters = $('#column_filter')[0].value.toLowerCase()
  var includeOnlyDiffering = $('#column_onlydiffering')[0].checked
  filters = filters.split(',')

  BFVUpdateTable(selectedWeapons, filters, includeOnlyDiffering)
  BFVUpdateDamageGraph(selectedWeapons)
  BFVUpdateTTKAndBTKGraphs(selectedWeapons)
}

/*
  Check correct number of selectors
  and if one of them should be removed
*/
function updateSelectors () {
  var selectorParent = $('#selectors')[0]
  var selectors = selectorParent.children

  // Remove empty selectors
  for (var i = 0; i < selectors.length; i++) {
    // Make sure we are left at least with one selector
    if (selectors[i].selectedIndex === 0 && selectors.length !== 1) {
      selectors[i].remove()
    }
  }

  // Make sure we have at least one empty selector
  if (selectors[selectors.length - 1].selectedIndex !== 0) {
    var clone = selectors[0].cloneNode(true)
    clone.onchange = BFVSelectorsOnChange
    selectorParent.appendChild(clone)
  }
}

/*
  Entrypoint for the comparison page.
  Note: This should called after all data has been loaded!
*/
function initializeBFVComparison () {
  var selectorParent = $('#selectors')[0]

  // TODO Create proper selectors
  //      (one for weapon and another for attachments)
  //      (Fill in possible weapons etc)

  // Create different options (i.e. weapons)
  // and add them to first selector
  var firstSelector = document.createElement('select')
  firstSelector.onchange = BFVSelectorsOnChange
  // First add empty option
  var option = document.createElement('option')
  option.text = ''
  firstSelector.add(option)
  for (var i = 0; i < BFVWeaponData.length; i++) {
    option = document.createElement('option')
    option.text = BFVWeaponData[i]['WeapShowName'] + ' ' + BFVWeaponData[i]['Attachments_short']
    firstSelector.add(option)
  }
  selectorParent.appendChild(firstSelector)

  // Set oninput for filter elements
  document.getElementById('column_filter').oninput = BFVFilterOnChange
  document.getElementById('column_onlydiffering').onclick = BFVFilterOnChange

  updateSelectors()
}
