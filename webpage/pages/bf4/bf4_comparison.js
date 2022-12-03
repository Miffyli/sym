// Logic behind comparison pages

// Text for the "no weapon selected" box
const BF4_SELECT_OPTION_0_TEXT = 'Select Weapon...'

// Color codes for the best/worst value
const BF4_NEUTRAL_VALUE_COLOR = [255, 255, 255]
const BF4_BEST_VALUE_COLOR = [0, 255, 0]
const BF4_WORST_VALUE_COLOR = [255, 0, 0]

// Used to prepend to id of customization buttons to make them all unique
// in order to accomodate mulitple instances of the same weapon.
var BF4AddVariantCounter = 0

/*
  Return list of select weapons (the
  full directory), according to
  select weapon names and attachments.
*/
function BF4GetSelectedWeapons () {
  var selectedWeapons = []

  $('.bf4-comp-selectorContainer').each(function () {
    if ($(this).find('select')[0].selectedIndex !== 0) {
      var selectedData = $(this).find('select option:selected')
      var selectedWeapName = selectedData[0].text.trim()
      var selectedAttachment1 = selectedData[1].value.trim()
      var selectedAttachment2 = selectedData[2].value.trim()
      var selectedAttachment3 = selectedData[3].value.trim()

      var attachmentString = selectedAttachment1 + "-" + selectedAttachment2 + "-" + selectedAttachment3

      // Find right weapon + attachments combination
      var weaponStats = BF4WeaponData.find(function (weapon) {
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
function BF4FilterTable (variableName, weaponValues, filters, includeOnlyDiffering) {
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
function BF4ColorVariables(variableName, weaponValues) {
  var colorCodes

  if (weaponValues.length == 1 || weaponValues.some(weaponValue => isNaN(weaponValue))) {
    // Only one item in the list or there are non-numeric values
    // -> Return neutral color
    colorCodes = weaponValues.map(weaponValue => BF4_NEUTRAL_VALUE_COLOR)
  } else {
    // Get unique values
    var uniqueValues = Array.from(new Set(weaponValues))
    // If we only have , do not bother with coloring
    if (uniqueValues.length === 1) {
      colorCodes = weaponValues.map(weaponValue => BF4_NEUTRAL_VALUE_COLOR)
    } else {
      // Sort by value so that "lower is worse".
      uniqueValues.sort((a, b) => a - b)

      // Values are now "higher is better".
      // If variable is not in BF4_LOWER_IS_WORSE, then
      // reverse the list
      if (!BF4_LOWER_IS_WORSE.has(variableName)) {
        uniqueValues.reverse()
      }

      colorCodes = []
      // Lower rank in uniqueValues -> worse value
      for (var i = 0; i < weaponValues.length; i++) {
        // -1 so that final value (best) has BF4_BEST_VALUE_COLOR
        var rankRatio = uniqueValues.indexOf(weaponValues[i]) / (uniqueValues.length - 1)
        colorCodes.push(
          BF4InterpolateRGB(BF4_WORST_VALUE_COLOR, BF4_BEST_VALUE_COLOR, rankRatio)
        )
      }
    }
  }
  // Turn RGB arrays to html color code
  colorCodes = colorCodes.map(colorCode => BF4ArrayToRGB(colorCode))
  return colorCodes
}

/*
  Update weapon table (i.e. create from scratch)
  with currently selected weapons and filters.
  Takes in a list of selected weapons, filter keywords (list)
  and boolean if only differing values should be included.
*/
function BF4UpdateTable (selectedWeapons, filters, includeOnlyDiffering) {
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
    for (var variableIndex = 0; variableIndex < BF4WeaponKeys.length; variableIndex++) {
      // Check filtering: Get variable name and the values, check if want
      // to include that variable and then include it
      var variableKey = BF4WeaponKeys[variableIndex]
      var weaponVariables = selectedWeapons.map(weapon => weapon[variableKey])

      if (BF4FilterTable(variableKey, weaponVariables, filters, includeOnlyDiffering) === true) {
        // Get coloring of the items
        var variableColoring = BF4ColorVariables(variableKey, weaponVariables)
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
function BF4UpdateDamageGraph (selectedWeapons) {
  var serieses = []
  for (var i = 0; i < selectedWeapons.length; i++) {
    var weapon = selectedWeapons[i]
    serieses.push({
      name: weapon['WeapShowName'],
      data: BF4GetDamageOverDistance(weapon)
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
function BF4UpdateTTKAndBTKGraphs (selectedWeapons) {
  var btkSerieses = []
  var ttkSerieses = []
  for (var i = 0; i < selectedWeapons.length; i++) {
    var weapon = selectedWeapons[i]
    btkSerieses.push({
      name: weapon['WeapShowName'],
      data: BF4GetBTKUpperBoundOverDistance(weapon)
    })
    ttkSerieses.push({
      name: weapon['WeapShowName'],
      data: BF4GetTTKUpperBoundOverDistance(weapon)
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
function BF4FilterOnChange () {
  var selectedWeapons = BF4GetSelectedWeapons()

  var filters = $('#column_filter')[0].value.toLowerCase()
  var includeOnlyDiffering = $('#column_onlydiffering')[0].checked
  filters = filters.split(',')

  BF4UpdateTable(selectedWeapons, filters, includeOnlyDiffering)
}

/*
  Callback function for when one of the UI selectors changes
  (different weapon, different attachments, different
  filters)
*/
function BF4SelectorsOnChange (e) {
  BF4updateSelectors()
  printBF4CustomizationButtons(e)
  var selectedWeapons = BF4GetSelectedWeapons()

  // Get filters for updating the table.
  var filters = $('#column_filter')[0].value.toLowerCase()
  var includeOnlyDiffering = $('#column_onlydiffering')[0].checked
  filters = filters.split(',')

  BF4UpdateTable(selectedWeapons, filters, includeOnlyDiffering)
  BF4UpdateDamageGraph(selectedWeapons)
  BF4UpdateTTKAndBTKGraphs(selectedWeapons)
}

/*
  Check correct number of selectors
  and if one of them should be removed
*/
function BF4updateSelectors () {
  $('.bf4-comp-selectorContainer > select').each(function() {
    if (this.selectedIndex === 0 && $('.bf4-comp-selectorContainer > select').length > 1) {
      $(this).parent().remove()
    }
  })

  var emptySelects = 0
  $('.bf4-comp-selectorContainer > select').each(function() {
    if (this.selectedIndex === 0) {
      emptySelects++
    }
  })

  if (emptySelects <= 1 && $('.bf4-comp-selectorContainer').length < 6) {
    $('.bf4-comp-selectorContainer').last().after($('.bf4-comp-selectorContainer').first().clone(true))
    $('.bf4-comp-selectorContainer').last().children('div').remove()
    $('.bf4-comp-selectorContainer').last().children('select').change(function (e) {
      BF4SelectorsOnChange(e)
    })
  }
}

/*
  Entrypoint for the comparison page.
  Note: This should called after all data has been loaded!
*/
function initializeBF4Comparison () {
  var selectorParent = $('#selectors')[0]

  // Create different options (i.e. weapons)
  // and add them to first selector
  var firstSelector = document.createElement('select')
  firstSelector.onchange = BF4SelectorsOnChange
  // First add empty option
  var option = document.createElement('option')
  option.text = BF4_SELECT_OPTION_0_TEXT
  firstSelector.add(option)
  var weaponNames = BF4WeaponData.filter(
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
  document.getElementById('column_filter').oninput = BF4FilterOnChange
  document.getElementById('column_onlydiffering').onclick = BF4FilterOnChange

  $('#selectors > select').addClass('comp-selectors').wrap("<div class='bf4-comp-selectorContainer'></div>")
  BF4updateSelectors()
}

/*
    Search the array for the entry with the given weapon name and return
    the index for it or '-1' if not found.
*/
function BF4getIndexOfAnyWeapon (weapon, weaponArray) {
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
function printBF4CustomizationButtons (e){
  var selectedSelect = ($(e.target).find('option:selected'))
  // Check it was a weapon that changed, not attachment
  if (selectedSelect.parent()[0].options[0].text.trim().localeCompare(BF4_SELECT_OPTION_0_TEXT) != 0) {
    return
  }
  var weapshowname = ($(e.target).find('option:selected').text().trim())

  // Check if weapon changed. If so, update the attachment selectors
  if(weapshowname.localeCompare(BF4_SELECT_OPTION_0_TEXT) != 0){
    $(selectedSelect).parent().siblings('div').remove()
    $(selectedSelect).parent().after(BF4compPrintCustomizations(weapshowname))
  }
}

/*
  Generates the html used for the customization buttons
*/
function BF4compPrintCustomizations (weaponName) {
  var custString = ''
  // Get any weapon data of this weapon name (we need the attachment infos)
  var weaponIndex = BF4getIndexOfAnyWeapon(weaponName, BF4WeaponData)
  var weapon = BF4WeaponData[weaponIndex]

  // Check which attachments are allowed for this weapon
  var allowedSlotAttachments = [0, 0]
  allowedSlotAttachments[0] = BF4_ALLOWED_ATTACHMENTS[0].filter(name => (weapon["Exist" + name] === "Yes" || name == "none"))
  allowedSlotAttachments[1] = BF4_ALLOWED_ATTACHMENTS[1].filter(name => (weapon["Exist" + name] === "Yes" || name == "none"))
  allowedSlotAttachments[2] = BF4_ALLOWED_ATTACHMENTS[2].filter(name => (weapon["Exist" + name] === "Yes" || name == "none"))

  // Create dropdown selectors
  custString += '<div>Attachments</div>'
  for (var i = 0; i < 3; i++) {
    custString += "<div class='bf4-comp-selectorContainerAttachments'><select onchange='BF4SelectorsOnChange(event)' id='" + BF4AddVariantCounter + weaponName + "1'>"
    for (var attachmentIndex = 0; attachmentIndex < allowedSlotAttachments[i].length; attachmentIndex++) {
      var humanName = BF4_ATTACHMENT_NAME_MAPPING[allowedSlotAttachments[i][attachmentIndex]]
      custString += "<option value='" + allowedSlotAttachments[i][attachmentIndex] + "'>" + humanName +  '</option>'
    }
    custString += '</select></div>'
  }
  BF4AddVariantCounter++

  return custString
}
