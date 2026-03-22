// Logic behind comparison pages

// Text for the "no weapon selected" box
const BF6_SELECT_OPTION_0_TEXT = 'Select Weapon...'

// Color codes for the best/worst value
const BF6_NEUTRAL_VALUE_COLOR = [255, 255, 255]
const BF6_BEST_VALUE_COLOR = [0, 255, 0]
const BF6_WORST_VALUE_COLOR = [255, 0, 0]

// Used to prepend to id of customization buttons to make them all unique
// in order to accomodate mulitple instances of the same weapon.
var BF6AddVariantCounter = 0

/*
  Return list of select weapons (the
  full directory), according to
  select weapon names and attachments.
*/
function BF6GetSelectedWeapons () {
  var selectedWeapons = []

  $('.bf6-comp-selectorContainer').each(function () {
    if ($(this).find('select')[0].selectedIndex !== 0) {
      var selectedData = $(this).find('select option:selected')
      var selectedWeapName = selectedData[0].text.trim()

      // Find right weapon and apply attachments combination
      var weaponStats = Object.values(BF6WeaponData).find(function (weapon) {
        return (
          weapon.displayname === selectedWeapName
        )
      })
      
      var weaponStatsCopy = Object.assign({}, weaponStats)
      
      selectedWeapons.push(weaponStatsCopy)
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
function BF6FilterTable (variableName, weaponValues, filters, includeOnlyDiffering) {
  var shouldInclude = true

  // Do not include the "raw_" variables
  if (variableName.indexOf('raw_') !== -1) {
    return false
  }

  // Hardcoded: Only include numeric values in the table (including "N/A")
  // TODO this should be done before-hand
  shouldInclude = weaponValues.every(weaponValue => (!isNaN(weaponValue) || weaponValue === 'N/A' || BF6_FORCE_COMPARISON_VALUES.has(variableName)))

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
function BF6ColorVariables (variableName, weaponValues) {
  var colorCodes

  if (weaponValues.length === 1 || weaponValues.some(weaponValue => isNaN(weaponValue))) {
    // Only one item in the list or there are non-numeric values
    // -> Return neutral color
    colorCodes = weaponValues.map(weaponValue => BF6_NEUTRAL_VALUE_COLOR)
  } else {
    // Get unique values
    var uniqueValues = Array.from(new Set(weaponValues))
    // If we only have , do not bother with coloring
    if (uniqueValues.length === 1) {
      colorCodes = weaponValues.map(weaponValue => BF6_NEUTRAL_VALUE_COLOR)
    } else {
      // Sort by value so that "lower (of abs) is worse".
      uniqueValues.sort((a, b) => Math.abs(a) - Math.abs(b))

      // Values are now "higher is better".
      // If variable is not in BF6_LOWER_IS_WORSE, then
      // reverse the list
      if (!BF6_LOWER_IS_WORSE.has(variableName)) {
        uniqueValues.reverse()
      }

      colorCodes = []
      // Lower rank in uniqueValues -> worse value
      for (var i = 0; i < weaponValues.length; i++) {
        // -1 so that final value (best) has BF6_BEST_VALUE_COLOR
        var rankRatio = uniqueValues.indexOf(weaponValues[i]) / (uniqueValues.length - 1)
        colorCodes.push(
          BF6InterpolateRGB(BF6_WORST_VALUE_COLOR, BF6_BEST_VALUE_COLOR, rankRatio)
        )
      }
    }
  }
  // Turn RGB arrays to html color code
  colorCodes = colorCodes.map(colorCode => BF6ArrayToRGB(colorCode))
  return colorCodes
}

/*
  Update weapon table (i.e. create from scratch)
  with currently selected weapons and filters.
  Takes in a list of selected weapons, filter keywords (list)
  and boolean if only differing values should be included.
*/
function BF6UpdateTable (selectedWeapons, filters, includeOnlyDiffering) {
  selectedWeapons = flattenWeapons(selectedWeapons)

  if (Object.keys(selectedWeapons).length > 0) {
    // Construct table as a HTML string we append later
    // to correct table. Hopefully this is fast enough.
    // Start with headers
    var tableHtml = '<table><tr><th></th>'
    selectedWeapons = Object.values(selectedWeapons)
    for (var i = 0; i < selectedWeapons.length; i++) {
      // Also add weapon name to table headers
      tableHtml += `<th>${selectedWeapons[i].displayname}</th>`
    }
    tableHtml += '</tr>'

    BF6WeaponKeys = Object.keys(selectedWeapons[0])  
    
    // Now for each row, show variable name and numbers
    for (var variableIndex = 0; variableIndex < BF6WeaponKeys.length; variableIndex++) {
      // Check filtering: Get variable name and the values, check if want
      // to include that variable and then include it
      var variableKey = BF6WeaponKeys[variableIndex]
      var weaponVariables = selectedWeapons.map(weapon => weapon[variableKey])

      if (BF6FilterTable(variableKey, weaponVariables, filters, includeOnlyDiffering) === true) {
        // Get coloring of the items
        var variableColoring = BF6ColorVariables(variableKey, weaponVariables)
        // Begin row and add variable name
        tableHtml += '<tr><td>' + variableKey + '</td>'
        for (var weaponIndex = 0; weaponIndex < weaponVariables.length; weaponIndex++) {
          if (Array.isArray(weaponVariables[weaponIndex])) {
            // If the value is an array, replace commas with newlines
            // and add a <br> tag at the end of each line
            var value = weaponVariables[weaponIndex].join('<br>')
            tableHtml += `<td style="color: ${variableColoring[weaponIndex]}"> ${value} </td>`
          } else {
            tableHtml += `<td style="color: ${variableColoring[weaponIndex]}"> ${weaponVariables[weaponIndex]} </td>`
          }
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
function BF6UpdateDamageGraph (selectedWeapons) {
  var serieses = []
  for (var i = 0; i < selectedWeapons.length; i++) {
    var weapon = selectedWeapons[i]
    serieses.push({
      name: weapon.displayname,
      data: BF6GetDamageOverDistance(weapon)
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
function BF6UpdateTTKAndBTKGraphs (selectedWeapons) {
  var btkSerieses = []
  var ttkSerieses = []
  for (var i = 0; i < selectedWeapons.length; i++) {
    var weapon = selectedWeapons[i]
    btkSerieses.push({
      name: weapon.displayname,
      data: BF6GetBTKUpperBoundOverDistance(weapon)
    })
    ttkSerieses.push({
      name: weapon.displayname,
      data: BF6GetTTKUpperBoundOverDistance(weapon)
    })
  }

  Highcharts.chart('btkub_graph', {
    title: {
      text: 'Bullets-to-kill upper bound'
    },

    subtitle: {
      text: 'Maximum number of bullets required for a bodyshot kill versus a player with 100hp.'
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
      text: 'Based on Rate of Fire and bodyshot damage versus a player with 100hp. Assumes all shots/pellets hit.'
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
function BF6FilterOnChange () {
  var selectedWeapons = BF6GetSelectedWeapons()

  var filters = $('#column_filter')[0].value.toLowerCase()
  var includeOnlyDiffering = $('#column_onlydiffering')[0].checked
  filters = filters.split(',')

  BF6UpdateTable(selectedWeapons, filters, includeOnlyDiffering)
}

/*
  Callback function for when one of the UI selectors changes
  (different weapon, different attachments, different
  filters)
*/
function BF6SelectorsOnChange (e) {
  BF6updateSelectors()
  printBF6CustomizationButtons(e)
  var selectedWeapons = BF6GetSelectedWeapons()

  // Get filters for updating the table.
  var filters = $('#column_filter')[0].value.toLowerCase()
  var includeOnlyDiffering = $('#column_onlydiffering')[0].checked
  filters = filters.split(',')

  BF6UpdateTable(selectedWeapons, filters, includeOnlyDiffering)
  BF6UpdateDamageGraph(selectedWeapons)
  BF6UpdateTTKAndBTKGraphs(selectedWeapons)
}

/*
  Check correct number of selectors
  and if one of them should be removed
*/
function BF6updateSelectors () {
  $('.bf6-comp-selectorContainer > select').each(function() {
    if (this.selectedIndex === 0 && $('.bf6-comp-selectorContainer > select').length > 1) {
      $(this).parent().remove()
    }
  })

  var emptySelects = 0
  $('.bf6-comp-selectorContainer > select').each(function() {
    if (this.selectedIndex === 0) {
      emptySelects++
    }
  })

  if (emptySelects <= 1 && $('.bf6-comp-selectorContainer').length < 6) {
    $('.bf6-comp-selectorContainer').last().after($('.bf6-comp-selectorContainer').first().clone(true))
    $('.bf6-comp-selectorContainer').last().children('div').remove()
    $('.bf6-comp-selectorContainer').last().children('select').change(function (e) {
      BF6SelectorsOnChange(e)
    })
  }
}

/*
  Entrypoint for the comparison page.
  Note: This should called after all data has been loaded!
*/
function initializeBF6Comparison () {
  var selectorParent = $('#selectors')[0]

  $('#version').text(BF6WeaponData.info.version)
  $('#versionDate').text(BF6WeaponData.info.versionDate)
  delete BF6WeaponData.info

  // Create different options (i.e. weapons)
  // and add them to first selector
  var firstSelector = document.createElement('select')
  firstSelector.onchange = BF6SelectorsOnChange
  // First add empty option
  var option = document.createElement('option')
  option.text = BF6_SELECT_OPTION_0_TEXT
  firstSelector.add(option)
  var weaponNames = Object.values(BF6WeaponData).map(weapon => weapon.displayname)

  //weaponNames.sort()
  
  for (var i = 0; i < weaponNames.length; i++) {
    option = document.createElement('option')
    option.text = weaponNames[i]
    firstSelector.add(option)
  }
  // Start with two empty choices already
  // (reminds people of it being a comparison)
  selectorParent.appendChild(firstSelector)


  // Set oninput for filter elements
  document.getElementById('column_filter').oninput = BF6FilterOnChange
  document.getElementById('column_onlydiffering').onclick = BF6FilterOnChange

  $('#selectors > select').addClass('comp-selectors').wrap("<div class='bf6-comp-selectorContainer'></div>")
  BF6updateSelectors()
}

/*
    Search the array for the entry with the given weapon name and return
    the index for it or '-1' if not found.
*/
function BF6getIndexOfAnyWeapon (weapon, weaponArray) {
  var weaponIndex = -1
  for (var i = 0; i < weaponArray.length; i++) {
    if (weaponArray[i].displayname === weapon) {
      weaponIndex = i
      break  // I hate breaks but this increases performance
    }
  }
  return weaponIndex
}

/*
  Create the html for the customization buttons for the selected weapon
*/
function printBF6CustomizationButtons (e){
  var selectedSelect = ($(e.target).find('option:selected'))
  // Check it was a weapon that changed, not attachment
  if (selectedSelect.parent()[0].options[0].text.trim().localeCompare(BF6_SELECT_OPTION_0_TEXT) != 0) {
    return
  }
  var weapshowname = ($(e.target).find('option:selected').text().trim())

  // Check if weapon changed. If so, update the attachment selectors
  if(weapshowname.localeCompare(BF6_SELECT_OPTION_0_TEXT) != 0){
    $(selectedSelect).parent().siblings('div').remove()
    //$(selectedSelect).parent().after(BF6compPrintCustomizations(weapshowname))
  }
}

/*
  Generates the html used for the customization buttons
*/
function BF6compPrintCustomizations (weaponName) {
  var custString = ''
  // Get any weapon data of this weapon name (we need the attachment infos)
  var weaponIndex = BF6getIndexOfAnyWeapon(weaponName, BF6WeaponData)
  var weapon = BF6WeaponData[weaponIndex]

  // Check which attachments are allowed for this weapon
  var allowedAttachments = [new Set(["Default" ]), new Set(["Default"]), new Set(["Default"])]
  var attachment_combos = weapon['attachments']
  for (const [key, value] of Object.entries(attachment_combos)) {
    var attachment_parts = key.split('-')
    allowedAttachments[0].add(attachment_parts[0])
    allowedAttachments[1].add(attachment_parts[1])
    allowedAttachments[2].add(attachment_parts[2])
  }

  // Create dropdown selectors
  custString += '<div>Attachments</div>'
  for (var i = 0; i < 3; i++) {
    var allowedAttachmentList = Array.from(allowedAttachments[i])
    allowedAttachmentList.sort()
    custString += "<div class='bf6-comp-selectorContainerAttachments'><select onchange='BF6SelectorsOnChange(event)' id='" + BF6AddVariantCounter + weaponName + "1'>"
    for (var attachmentIndex = 0; attachmentIndex < allowedAttachmentList.length; attachmentIndex++) {
      // TODO create this list of the name mappings
      //var humanName = BF6_ATTACHMENT_NAME_MAPPING[allowedSlotAttachments[i][attachmentIndex]]
      var humanName = allowedAttachmentList[attachmentIndex]
      if (allowedAttachmentList[attachmentIndex] === "Default") {
        // make default
        custString += "<option selected value='" + allowedAttachmentList[attachmentIndex] + "'>" + allowedAttachmentList[attachmentIndex] + '</option>'
      } else {
        custString += "<option value='" + allowedAttachmentList[attachmentIndex] + "'>" + allowedAttachmentList[attachmentIndex] + '</option>'
      }
    }
    custString += '</select></div>'
  }
  BF6AddVariantCounter++

  return custString
}
