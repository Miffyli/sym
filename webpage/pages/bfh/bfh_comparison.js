// Logic behind comparison pages

// Text for the "no weapon selected" box
const BFH_SELECT_OPTION_0_TEXT = 'Select Weapon...'

// Color codes for the best/worst value
const BFH_NEUTRAL_VALUE_COLOR = [255, 255, 255]
const BFH_BEST_VALUE_COLOR = [0, 255, 0]
const BFH_WORST_VALUE_COLOR = [255, 0, 0]

// Used to prepend to id of customization buttons to make them all unique
// in order to accomodate mulitple instances of the same weapon.
var BFHAddVariantCounter = 0

/*
  Return list of select weapons (the
  full directory), according to
  select weapon names and attachments.
*/
function BFHGetSelectedWeapons () {
  var selectedWeapons = []

  $('.bfh-comp-selectorContainer').each(function () {
    if ($(this).find('select')[0].selectedIndex !== 0) {
      var selectedData = $(this).find('select option:selected')
      var selectedWeapName = selectedData[0].text.trim()
      var selectedAttachment1 = selectedData[1].value.trim()
      var selectedAttachment2 = selectedData[2].value.trim()
      var selectedAttachment3 = selectedData[3].value.trim()

      var attachmentString = selectedAttachment1 + "-" + selectedAttachment2 + "-" + selectedAttachment3

      // Find right weapon + attachments combination
      var weaponStats = BFHWeaponData.find(function (weapon) {
        return (
          weapon.WeapShowName === selectedWeapName &&
          weapon.attachments === attachmentString
        )
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
function BFHFilterTable (variableName, weaponValues, filters, includeOnlyDiffering) {
  var shouldInclude = true

  // Do not include the "raw_" variables
  if (variableName.indexOf('raw_') !== -1) {
    return false
  }

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
function BFHColorVariables(variableName, weaponValues) {
  var colorCodes

  if (weaponValues.length == 1 || weaponValues.some(weaponValue => isNaN(weaponValue))) {
    // Only one item in the list or there are non-numeric values
    // -> Return neutral color
    colorCodes = weaponValues.map(weaponValue => BFH_NEUTRAL_VALUE_COLOR)
  } else {
    // Get unique values
    var uniqueValues = Array.from(new Set(weaponValues))
    // If we only have , do not bother with coloring
    if (uniqueValues.length === 1) {
      colorCodes = weaponValues.map(weaponValue => BFH_NEUTRAL_VALUE_COLOR)
    } else {
      // Sort by value so that "lower is worse".
      uniqueValues.sort((a, b) => a - b)

      // Values are now "higher is better".
      // If variable is not in BFH_LOWER_IS_WORSE, then
      // reverse the list
      if (!BFH_LOWER_IS_WORSE.has(variableName)) {
        uniqueValues.reverse()
      }

      colorCodes = []
      // Lower rank in uniqueValues -> worse value
      for (var i = 0; i < weaponValues.length; i++) {
        // -1 so that final value (best) has BFH_BEST_VALUE_COLOR
        var rankRatio = uniqueValues.indexOf(weaponValues[i]) / (uniqueValues.length - 1)
        colorCodes.push(
          BFHInterpolateRGB(BFH_WORST_VALUE_COLOR, BFH_BEST_VALUE_COLOR, rankRatio)
        )
      }
    }
  }
  // Turn RGB arrays to html color code
  colorCodes = colorCodes.map(colorCode => BFHArrayToRGB(colorCode))
  return colorCodes
}

/*
  Update weapon table (i.e. create from scratch)
  with currently selected weapons and filters.
  Takes in a list of selected weapons, filter keywords (list)
  and boolean if only differing values should be included.
*/
function BFHUpdateTable (selectedWeapons, filters, includeOnlyDiffering) {
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
    for (var variableIndex = 0; variableIndex < BFHWeaponKeys.length; variableIndex++) {
      // Check filtering: Get variable name and the values, check if want
      // to include that variable and then include it
      var variableKey = BFHWeaponKeys[variableIndex]
      var weaponVariables = selectedWeapons.map(weapon => weapon[variableKey])

      if (BFHFilterTable(variableKey, weaponVariables, filters, includeOnlyDiffering) === true) {
        // Get coloring of the items
        var variableColoring = BFHColorVariables(variableKey, weaponVariables)
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
function BFHUpdateDamageGraph (selectedWeapons) {
  var serieses = []
  for (var i = 0; i < selectedWeapons.length; i++) {
    var weapon = selectedWeapons[i]
    serieses.push({
      name: weapon['WeapShowName'],
      data: BFHGetDamageOverDistance(weapon)
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
function BFHUpdateTTKAndBTKGraphs (selectedWeapons) {
  var btkSerieses = []
  var ttkSerieses = []
  for (var i = 0; i < selectedWeapons.length; i++) {
    var weapon = selectedWeapons[i]
    btkSerieses.push({
      name: weapon['WeapShowName'],
      data: BFHGetBTKUpperBoundOverDistance(weapon)
    })
    ttkSerieses.push({
      name: weapon['WeapShowName'],
      data: BFHGetTTKUpperBoundOverDistance(weapon)
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
      text: 'Based on Rate of Fire and bodyshot damage versus a player with 100HP. Assumes all shots/pellets hit.'
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
function BFHFilterOnChange () {
  var selectedWeapons = BFHGetSelectedWeapons()

  var filters = $('#column_filter')[0].value.toLowerCase()
  var includeOnlyDiffering = $('#column_onlydiffering')[0].checked
  filters = filters.split(',')

  BFHUpdateTable(selectedWeapons, filters, includeOnlyDiffering)
}

/*
  Callback function for when one of the UI selectors changes
  (different weapon, different attachments, different
  filters)
*/
function BFHSelectorsOnChange (e) {
  BFHupdateSelectors()
  printBFHCustomizationButtons(e)
  var selectedWeapons = BFHGetSelectedWeapons()

  // Get filters for updating the table.
  var filters = $('#column_filter')[0].value.toLowerCase()
  var includeOnlyDiffering = $('#column_onlydiffering')[0].checked
  filters = filters.split(',')

  BFHUpdateTable(selectedWeapons, filters, includeOnlyDiffering)
  BFHUpdateDamageGraph(selectedWeapons)
  BFHUpdateTTKAndBTKGraphs(selectedWeapons)
}

/*
  Check correct number of selectors
  and if one of them should be removed
*/
function BFHupdateSelectors () {
  $('.bfh-comp-selectorContainer > select').each(function() {
    if (this.selectedIndex === 0 && $('.bfh-comp-selectorContainer > select').length > 1) {
      $(this).parent().remove()
    }
  })

  var emptySelects = 0
  $('.bfh-comp-selectorContainer > select').each(function() {
    if (this.selectedIndex === 0) {
      emptySelects++
    }
  })

  if (emptySelects <= 1 && $('.bfh-comp-selectorContainer').length < 6) {
    $('.bfh-comp-selectorContainer').last().after($('.bfh-comp-selectorContainer').first().clone(true))
    $('.bfh-comp-selectorContainer').last().children('div').remove()
    $('.bfh-comp-selectorContainer').last().children('select').change(function (e) {
      BFHSelectorsOnChange(e)
    })
  }
}

/*
  Entrypoint for the comparison page.
  Note: This should called after all data has been loaded!
*/
function initializeBFHComparison () {
  var selectorParent = $('#selectors')[0]

  // Create different options (i.e. weapons)
  // and add them to first selector
  var firstSelector = document.createElement('select')
  firstSelector.onchange = BFHSelectorsOnChange
  // First add empty option
  var option = document.createElement('option')
  option.text = BFH_SELECT_OPTION_0_TEXT
  firstSelector.add(option)
  var weaponNames = BFHWeaponData.filter(
    weapon => weapon['attachments'] === 'none-none-none'
  ).map(
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
  document.getElementById('column_filter').oninput = BFHFilterOnChange
  document.getElementById('column_onlydiffering').onclick = BFHFilterOnChange

  $('#selectors > select').addClass('comp-selectors').wrap("<div class='bfh-comp-selectorContainer'></div>")
  BFHupdateSelectors()
}

/*
    Search the array for the entry with the given weapon name and return
    the index for it or '-1' if not found.
*/
function BFHgetIndexOfAnyWeapon (weapon, weaponArray) {
  var weaponIndex = -1
  for (var i = 0; i < weaponArray.length; i++) {
    if (weaponArray[i].WeapShowName === weapon) {
      weaponIndex = i
      break  // I hate breaks but this increases performance
    }
  }
  return weaponIndex
}

/*
  Create the html for the customization buttons for the selected weapon
*/
function printBFHCustomizationButtons (e){
  var selectedSelect = ($(e.target).find('option:selected'))
  // Check it was a weapon that changed, not attachment
  if (selectedSelect.parent()[0].options[0].text.trim().localeCompare(BFH_SELECT_OPTION_0_TEXT) != 0) {
    return
  }
  var weapshowname = ($(e.target).find('option:selected').text().trim())

  // Check if weapon changed. If so, update the attachment selectors
  if(weapshowname.localeCompare(BFH_SELECT_OPTION_0_TEXT) != 0){
    $(selectedSelect).parent().siblings('div').remove()
    $(selectedSelect).parent().after(BFHcompPrintCustomizations(weapshowname))
  }
}

/*
  Generates the html used for the customization buttons
*/
function BFHcompPrintCustomizations (weaponName) {
  var custString = ''
  // Get any weapon data of this weapon name (we need the attachment infos)
  var weaponIndex = BFHgetIndexOfAnyWeapon(weaponName, BFHWeaponData)
  var weapon = BFHWeaponData[weaponIndex]

  // Check which attachments are allowed for this weapon
  var allowedSlotAttachments = [0, 0]
  allowedSlotAttachments[0] = BFH_ALLOWED_ATTACHMENTS[0].filter(name => (weapon["Exist" + name] === "Yes" || name == "none"))
  allowedSlotAttachments[1] = BFH_ALLOWED_ATTACHMENTS[1].filter(name => (weapon["Exist" + name] === "Yes" || name == "none"))
  allowedSlotAttachments[2] = BFH_ALLOWED_ATTACHMENTS[2].filter(name => (weapon["Exist" + name] === "Yes" || name == "none"))

  // Create dropdown selectors
  custString += '<div>Attachments</div>'
  for (var i = 0; i < 3; i++) {
    custString += "<div class='bfh-comp-selectorContainerAttachments'><select onchange='BFHSelectorsOnChange(event)' id='" + BFHAddVariantCounter + weaponName + "1'>"
    for (var attachmentIndex = 0; attachmentIndex < allowedSlotAttachments[i].length; attachmentIndex++) {
      var humanName = BFH_ATTACHMENT_NAME_MAPPING[allowedSlotAttachments[i][attachmentIndex]]
      custString += "<option value='" + allowedSlotAttachments[i][attachmentIndex] + "'>" + humanName +  '</option>'
    }
    custString += '</select></div>'
  }
  BFHAddVariantCounter++

  return custString
}
