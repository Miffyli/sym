// Logic behind comparison pages

// Text for the "no weapon selected" box
const BFV_SELECT_OPTION_0_TEXT = 'Select Weapon...'

// Color codes for the best/worst value
const BFV_NEUTRAL_VALUE_COLOR = [255, 255, 255]
const BFV_BEST_VALUE_COLOR = [0, 255, 0]
const BFV_WORST_VALUE_COLOR = [255, 0, 0]

// Array used to generate cutomizatinos buttons for each weapon
// The array is generated in a function below
var BFVCustomizationsArray = []

// Used to prepend to id of customization buttons to make them all unique
// in order to accomodate mulitple instances of the same weapon.
var BFVAddVariantCounter = 0

/* These mappings are used for the labels on the customization buttons
   These need to be updated if DICE comes out with new customization types.
*/
var BFVCustomizationStrings = new Object()
BFVCustomizationStrings.QADS = 'Quick Aim'
BFVCustomizationStrings.ADSM = 'Custom Stock'
BFVCustomizationStrings.MoAD = 'Lightened Stock'
BFVCustomizationStrings.Bayo = 'Bayonet'
BFVCustomizationStrings.QRel = 'Quick Reload'
BFVCustomizationStrings.QDep = 'Slings and Swivels'
BFVCustomizationStrings.QCyc = 'Machined Bolt'
BFVCustomizationStrings.Zero = 'Variable Zeroing'
BFVCustomizationStrings.VRec = 'Recoil Buffer'
BFVCustomizationStrings.ITri = 'Trigger Job'
BFVCustomizationStrings.Hipf = 'Enhanced Grips'
BFVCustomizationStrings.IADS = 'Barrel Bedding'
BFVCustomizationStrings.DMag = 'Detachable Magazines'
BFVCustomizationStrings.Bipo = 'Bipod'
BFVCustomizationStrings.FBul = 'High Velocity Bullets'
BFVCustomizationStrings.Long = 'Low Drag Rounds'
BFVCustomizationStrings.ADSS = 'Barrel Bedding'
BFVCustomizationStrings.HRec = 'Ported Barrel'
BFVCustomizationStrings.Heav = 'Heavy Load'
BFVCustomizationStrings.Pene = 'Penetrating Shot'
BFVCustomizationStrings.ExMa = 'Extended Magazine'
BFVCustomizationStrings.Slug = 'Slugs'
BFVCustomizationStrings.Head = 'Solid Slug'
BFVCustomizationStrings.IBip = 'Improved Bipod'
BFVCustomizationStrings.Flas = 'Flashless Propellant'
BFVCustomizationStrings.IROF = 'Light Bolt'
BFVCustomizationStrings.Ince = 'Incendiary Bullets'
BFVCustomizationStrings.Cool = 'Chrome Lining'
BFVCustomizationStrings.Magd = 'Polished Action'
BFVCustomizationStrings.Chok = 'Internal Choke'
BFVCustomizationStrings.ExBe = 'Extended Belt'
BFVCustomizationStrings.Drum = 'Double Drum Magazine'
BFVCustomizationStrings.Gren = 'Improved Grenades'
BFVCustomizationStrings.APCR = 'APCR Bullets'

/*
  Return list of select weapons (the
  full directory), according to
  select weapon names and attachments.
*/
function BFVGetSelectedWeapons () {
  var selectedWeapons = []

  $('.comp-selectorContainer').each(function () {
    if ($(this).find('select')[0].selectedIndex !== 0) {
      var selectedCusts = $(this).find('select option:selected').text().trim()
      $(this).find('.custButton').each(function () {
        if ($(this).is(':checked')) {
          selectedCusts += $(this).next('label').data('shortname')
        }
      })

      var weaponStats = BFVWeaponData.find(function (element) {
        return element.WeapAttachmentKey === selectedCusts
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
  Return an array of color codes, each representing the color to be used
  for that value. Used in the comparison to color values from best to worse.
  variableName: Name of the variable
  weaponValues: List of values for variableName from different weapons
*/
function BFVColorVariables(variableName, weaponValues) {
  var colorCodes

  if (weaponValues.length == 1 || weaponValues.some(weaponValue => isNaN(weaponValue))) {
    // Only one item in the list or there are non-numeric values
    // -> Return neutral color
    colorCodes = weaponValues.map(weaponValue => BFV_NEUTRAL_VALUE_COLOR)
  } else {
    // Get unique values
    var uniqueValues = Array.from(new Set(weaponValues))
    // If we only have , do not bother with coloring
    if (uniqueValues.length === 1) {
      colorCodes = weaponValues.map(weaponValue => BFV_NEUTRAL_VALUE_COLOR)
    } else {
      // Sort by value so that "lower is worse".
      uniqueValues.sort()

      // Values are now "higher is better".
      // If variable is not in BFV_LOWER_IS_WORSE, then
      // reverse the list
      if (!BFV_LOWER_IS_WORSE.has(variableName)) {
      	uniqueValues.reverse()
      }

      colorCodes = []
      // Lower rank in uniqueValues -> worse value
      for (var i = 0; i < weaponValues.length; i++) {
        // -1 so that final value (best) has BFV_BEST_VALUE_COLOR
        var rankRatio = uniqueValues.indexOf(weaponValues[i]) / (uniqueValues.length - 1)
        colorCodes.push(
          BFVInterpolateRGB(BFV_WORST_VALUE_COLOR, BFV_BEST_VALUE_COLOR, rankRatio)
        )
      }
    }
  }
  // Turn RGB arrays to html color code
  colorCodes = colorCodes.map(colorCode => BFVArrayToRGB(colorCode))
  return colorCodes
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
        // Get coloring of the items
        var variableColoring = BFVColorVariables(variableKey, weaponVariables)
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
function BFVSelectorsOnChange (e) {
  BFVupdateSelectors()
  printBFVCustomizationButtons(e)
  var selectedWeapons = BFVGetSelectedWeapons()

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
function BFVupdateSelectors () {
  $('.comp-selectorContainer > select').each(function() {
    if (this.selectedIndex === 0 && $('.comp-selectorContainer > select').length > 1) {
      $(this).parent().remove()
    }
  })

  var emptySelects = 0
  $('.comp-selectorContainer > select').each(function() {
    if (this.selectedIndex === 0) {
      emptySelects++
    }
  })

  if (emptySelects <= 1 && $('.comp-selectorContainer').length < 6) {
    $('.comp-selectorContainer').last().after($('.comp-selectorContainer').first().clone(true))
    $('.comp-selectorContainer').last().children('div').remove()
    $('.comp-selectorContainer').last().children('select').change(function (e) {
      BFVSelectorsOnChange(e)
    })
  }
}

/*
  Entrypoint for the comparison page.
  Note: This should called after all data has been loaded!
*/
function initializeBFVComparison () {
  var selectorParent = $('#selectors')[0]

  // Create different options (i.e. weapons)
  // and add them to first selector
  var firstSelector = document.createElement('select')
  firstSelector.onchange = BFVSelectorsOnChange
  // First add empty option
  var option = document.createElement('option')
  option.text = BFV_SELECT_OPTION_0_TEXT
  firstSelector.add(option)
  var weaponNames = BFVWeaponData.filter(
    weapon => weapon['Attachments_short'] == ""
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
  document.getElementById('column_filter').oninput = BFVFilterOnChange
  document.getElementById('column_onlydiffering').onclick = BFVFilterOnChange


  BFVgenerateBFVCustomizationsArray()
  $('#selectors > select').addClass('comp-selectors').wrap("<div class='comp-selectorContainer'></div>")
  BFVupdateSelectors()
}

/*
  Creates an array used to generate the spec/customization buttons.  Each entry
  is an array of 4 objects that represent the 4 spec tiers. 'a' is left side,
  'b' is right side.  Each entry also has a weaponName variable There is one
  entry per weapon.
*/
function BFVgenerateBFVCustomizationsArray () {
    $.each(BFVWeaponData, function (key, weapon) {
      var weaponIndex = BFVgetIndexOfWeapon(weapon.WeapShowName, BFVCustomizationsArray)
      if (weaponIndex < 0) {
        var newWeaponEntry = new Object()
        newWeaponEntry.weaponName = weapon.WeapShowName
        newWeaponEntry.customizations = new Array({a:"",b:""}, {a:"",b:""}, {a:"",b:""}, {a:"",b:""});
        weaponIndex = BFVCustomizationsArray.push(newWeaponEntry) - 1
      }

      if (weapon.Attachments_short.length > 0){
        var short_attachments = weapon.Attachments_short.split('+')
        for (var i = 0; i < short_attachments.length; i++) {
          if ((BFVCustomizationsArray[weaponIndex].customizations[i].a.localeCompare(short_attachments[i]) !== 0) && (BFVCustomizationsArray[weaponIndex].customizations[i].b.localeCompare(short_attachments[i]) != 0)){
            if (BFVCustomizationsArray[weaponIndex].customizations[i].a.length === 0) {
              BFVCustomizationsArray[weaponIndex].customizations[i].a = short_attachments[i]
            } else {
              BFVCustomizationsArray[weaponIndex].customizations[i].b = short_attachments[i]
            }
          }
        }
      }
    })
}

/*
    Search the array for the entry with the given weapon name and return
    the index for it or '-1' if not found.
*/
function BFVgetIndexOfWeapon (weapon, customizationArray) {
  var weaponIndex = -1
  for (var i = 0; i < customizationArray.length; i++) {
    if (customizationArray[i].weaponName === weapon) {
      weaponIndex = i
      break  // I hate breaks but this increases performance
    }
  }
  return weaponIndex
}

/*
  Create the html for the customization buttons for the selected weapon
*/
function printBFVCustomizationButtons (e){
  var selectedSelect = ($(e.target).find('option:selected'))
  var selectedOption = ($(e.target).find('option:selected').text().trim())


  if(selectedOption.localeCompare(BFV_SELECT_OPTION_0_TEXT) != 0){
    $(selectedSelect).parent().siblings('div').remove()
    $(selectedSelect).parent().after(BFVcompPrintCustomizations(selectedOption))
    $(selectedSelect).parent().parent().find('input').checkboxradio(
      {icon: false }
    )
    BFVcompInitializeCustomizationButtons($(selectedSelect).parent().parent().find('.custButton'))
  }

}

/*
  Generates the html used for the customization buttons
*/
function BFVcompPrintCustomizations (weaponName) {
  var custString = ''
  var weaponIndex = BFVgetIndexOfWeapon(weaponName, BFVCustomizationsArray)
  var weaponCust = BFVCustomizationsArray[weaponIndex].customizations

  if (weaponCust[0].a !== '') {
    for (var i = 0; i < weaponCust.length; i++) {
      var rowClass = 'custRow' + i.toString()
      custString += '<div>'
      custString += "<input id='" + BFVAddVariantCounter + weaponName + weaponCust[i].a + i.toString() + "' name='" + BFVAddVariantCounter + weaponName + i.toString() + "' type='radio' class='custButton " + rowClass + " custCol1'><label data-shortname='" + weaponCust[i].a + "' for='" + BFVAddVariantCounter + weaponName + weaponCust[i].a + i.toString() + "'>" + BFVCustomizationStrings[weaponCust[i].a] + '</label>'
      custString += "<input id='" + BFVAddVariantCounter + weaponName + weaponCust[i].b + i.toString() + "' name='" + BFVAddVariantCounter + weaponName + i.toString() + "' type='radio' class='custButton " + rowClass + " custCol2'><label data-shortname='" + weaponCust[i].b + "' for='" + BFVAddVariantCounter + weaponName + weaponCust[i].b + i.toString() + "'>" + BFVCustomizationStrings[weaponCust[i].b] + '</label>'
      custString += '</div>'
    }
  }
  BFVAddVariantCounter++

  return custString
}

/*
  Creates event handlers for the customization buttons so that users are only
  allowed to click on the appropriate ones. i.e. only click 2nd tier button if
  a 1st tier button has been selected.
*/
function BFVcompInitializeCustomizationButtons (buttonObj) {
    $(buttonObj).change(function () {
      if ($(this).is(':checked') || $(this).siblings('.custButton').is(':checked')) {
        if ($(this).hasClass('custRow1')) {
          var thisCol = $(this).hasClass('custCol1') ? '.custCol1' : '.custCol2'
          $(this).parent().next().children(thisCol).checkboxradio('enable')
        } else {
          $(this).parent().next().children('.custButton').checkboxradio('enable')
        }
      }
    })

    $(buttonObj).click(function () {
      if ($(this).hasClass('custRow1')) {
        $(this).parent().nextAll().children('.custButton').prop('checked', false).change()
        $(this).parent().nextAll().children('.custButton').checkboxradio('disable')
      }

      var thisId = $(this).attr('id')
      if ($(this).siblings("label[for='" + thisId + "']").hasClass('ui-state-active')) {
        $(this).prop('checked', false).change()
        $(this).parent().nextAll().children('.custButton').prop('checked', false).change()
        $(this).parent().nextAll().children('.custButton').checkboxradio('disable')
      }

      this.blur()
      var selectedCusts = $(this).parentsUntil('.tbody', 'tr').find('td.firstColumn > .lblWeaponName').text()
      $(this).parent().parent().find('.custButton').each(function () {
        if ($(this).is(':checked')) {
          selectedCusts += $(this).next('label').data('shortname')
        }
      })

      var selectedWeapons = BFVGetSelectedWeapons()

      // Get filters for updating the table.
      var filters = $('#column_filter')[0].value.toLowerCase()
      var includeOnlyDiffering = $('#column_onlydiffering')[0].checked
      filters = filters.split(',')

      BFVUpdateTable(selectedWeapons, filters, includeOnlyDiffering)
      BFVUpdateDamageGraph(selectedWeapons)
      BFVUpdateTTKAndBTKGraphs(selectedWeapons)
    })

    $(buttonObj).parent().parent().find('div:not(:nth-child(2)) .custButton').checkboxradio('disable')
}
