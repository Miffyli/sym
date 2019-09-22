// Logic behind comparison pages

// Array used to generate cutomizatinos buttons for each weapon
// The array is generated in a function below
var bfvCustomizationsArray = [];

// Used to prepend to id of customization buttons to make them all unique
// in order to accomodate mulitple instances of the same weapon.
var addVariantCounter = 0;

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

  $('.comp-selectorContainer').each(function(){
    if ($(this).find("select")[0].selectedIndex !== 0){
        var selectedCusts = $(this).find("select option:selected").text().trim();
        $(this).find(".custButton").each(function(){
          if($(this).is(":checked")){
            selectedCusts += $(this).next("label").data("shortname");
          }
        })

        var weaponStats = BFVWeaponData.find(function(element){
            return element.WeapAttachmentKey == selectedCusts;
        });
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
function BFVSelectorsOnChange (e) {
  updateSelectors()
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
function updateSelectors () {
  $(".comp-selectorContainer > select").each(function() {
      if (this.selectedIndex == 0 && $(".comp-selectorContainer > select").length > 1){
          $(this).parent().remove()
      }
  })

  var emptySelects = 0
  $(".comp-selectorContainer > select").each(function() {
    if(this.selectedIndex == 0){
        emptySelects++
    }
  })

  if(emptySelects == 0 && $(".comp-selectorContainer").length < 6){
    $(".comp-selectorContainer").last().after($(".comp-selectorContainer").first().clone(true));
    $(".comp-selectorContainer").last().children("div").remove();
    $(".comp-selectorContainer").last().children("select").change(function(e) {
      BFVSelectorsOnChange(e)
    });
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
  option.text = 'Select Weapon...'
  firstSelector.add(option)
  for (var i = 0; i < BFVWeaponData.length; i++) {
    if (BFVWeaponData[i]['Attachments_short'] == ""){
      option = document.createElement('option')
      option.text = BFVWeaponData[i]['WeapShowName']
      firstSelector.add(option)
    }
  }
  selectorParent.appendChild(firstSelector)

  // Set oninput for filter elements
  document.getElementById('column_filter').oninput = BFVFilterOnChange
  document.getElementById('column_onlydiffering').onclick = BFVFilterOnChange

  updateSelectors()

  generateBFVCustomizationsArray()
  $("#selectors > select").addClass("comp-selectors").wrap( "<div class='comp-selectorContainer'></div>" )
  //$("#column_onlydiffering").checkboxradio();
}

/*
  Creates an array used to generate the spec/customization buttons.  Each entry
  is an array of 4 objects that represent the 4 spec tiers. 'a' is left side,
  'b' is right side.  Each entry also has a weaponName variable There is one
  entry per weapon.
*/
function generateBFVCustomizationsArray(){
    $.each(BFVWeaponData, function(key, weapon) {
        var weaponIndex = getIndexOfWeapon(weapon.WeapShowName, bfvCustomizationsArray)
        if(weaponIndex < 0){
            var newWeaponEntry = new Object()
            newWeaponEntry.weaponName = weapon.WeapShowName
            newWeaponEntry.customizations = new Array({a:"",b:""}, {a:"",b:""}, {a:"",b:""}, {a:"",b:""});
            weaponIndex = bfvCustomizationsArray.push(newWeaponEntry) - 1
        }

        if (weapon.Attachments_short.length > 0){
            var short_attachments = weapon.Attachments_short.split("+")
            for (var i = 0; i < short_attachments.length; i++){
                if ((bfvCustomizationsArray[weaponIndex].customizations[i].a.localeCompare(short_attachments[i]) != 0) && (bfvCustomizationsArray[weaponIndex].customizations[i].b.localeCompare(short_attachments[i]) != 0)){
                    if (bfvCustomizationsArray[weaponIndex].customizations[i].a.length == 0){
                        bfvCustomizationsArray[weaponIndex].customizations[i].a = short_attachments[i];
                    } else {
                        bfvCustomizationsArray[weaponIndex].customizations[i].b = short_attachments[i];
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
function getIndexOfWeapon(weapon, customizationArray){
    var weaponIndex = -1;
    for (var i = 0; i < customizationArray.length; i++){
        if (customizationArray[i].weaponName == weapon){
            weaponIndex = i;
            break;  // I hate breaks but this increases performance
        }
    }
    return weaponIndex;
}


/*
  Create the html for the customization buttons for the selected weapon
*/
function printBFVCustomizationButtons(e){
  var selectedSelect = ($(e.target).find("option:selected"))
  var selectedOption = ($(e.target).find("option:selected").text().trim())

  $(selectedSelect).parent().siblings("div").remove()
  $(selectedSelect).parent().after(printCustomizations(selectedOption))
  $(selectedSelect).parent().parent().find("input").checkboxradio(
      {icon:false}
  );
  initializeCustomizationButtons($(selectedSelect).parent().parent().find(".custButton"))
}


/*
  Generates the html used for the customization buttons
*/
function printCustomizations(weaponName){
    var custString = "";
    var weaponIndex = getIndexOfWeapon(weaponName, bfvCustomizationsArray)
    var weaponCust = bfvCustomizationsArray[weaponIndex].customizations

    if(weaponCust[0].a != ""){
        for (var i = 0; i < weaponCust.length; i++){
            var rowClass = "custRow" + i.toString();
            custString +="<div>"
            custString += "<input id='" + addVariantCounter + weaponName + weaponCust[i].a + i.toString() + "' name='" + addVariantCounter + weaponName + i.toString() + "' type='radio' class='custButton " + rowClass + " custCol1'><label data-shortname='" + weaponCust[i].a + "' for='" + addVariantCounter + weaponName + weaponCust[i].a + i.toString() + "'>" + customizationStrings[weaponCust[i].a] + "</label>";
            custString += "<input id='" + addVariantCounter + weaponName + weaponCust[i].b + i.toString() + "' name='" + addVariantCounter + weaponName + i.toString() + "' type='radio' class='custButton " + rowClass + " custCol2'><label data-shortname='" + weaponCust[i].b + "' for='" + addVariantCounter + weaponName + weaponCust[i].b + i.toString() + "'>" + customizationStrings[weaponCust[i].b] + "</label>";
            custString += "</div>"
        }
    }
    addVariantCounter++

    return custString;
}

/*
  Creates event handlers for the customization buttons so that users are only
  allowed to click on the appropriate ones. i.e. only click 2nd tier button if
  a 1st tier button has been selected.
*/
function initializeCustomizationButtons(buttonObj){
    $(buttonObj).change(function(){
        if ($(this).is(":checked") || $(this).siblings(".custButton").is(":checked")) {
            if ($(this).hasClass("custRow1")){
                var thisCol = $(this).hasClass("custCol1") ? ".custCol1" : ".custCol2";
                $(this).parent().next().children(thisCol).checkboxradio("enable");
            } else {
                $(this).parent().next().children(".custButton").checkboxradio("enable");
            }
        }
    });

    $(buttonObj).click(function(){
        if ($(this).hasClass("custRow1")){
            $(this).parent().nextAll().children(".custButton").prop("checked", false).change();
            $(this).parent().nextAll().children(".custButton").checkboxradio("disable");
        }

        var thisId = $(this).attr("id");
        if ($(this).siblings("label[for='" + thisId +"']").hasClass("ui-state-active")){
            $(this).prop("checked", false).change();
            $(this).parent().nextAll().children(".custButton").prop("checked", false).change();
            $(this).parent().nextAll().children(".custButton").checkboxradio("disable");
        } else {

        }
        this.blur();
        var selectedCusts = $(this).parentsUntil(".tbody", "tr").find("td.firstColumn > .lblWeaponName").text();
        $(this).parent().parent().find(".custButton").each(function(){
            if($(this).is(":checked")){
                selectedCusts += $(this).next("label").data("shortname");
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
    });

    $(buttonObj).parent().parent().find("div:not(:nth-child(2)) .custButton").checkboxradio("disable");
}

/* These mappings are used for the labels on the customization buttons
   These need to be updated if DICE comes out with new customization types.
*/
var customizationStrings = new Object();
customizationStrings.QADS = "Quick Aim";
customizationStrings.ADSM = "Custom Stock";
customizationStrings.MoAD = "Lightened Stock";
customizationStrings.Bayo = "Bayonet";
customizationStrings.QRel = "Quick Reload";
customizationStrings.QDep = "Slings and Swivels";
customizationStrings.QCyc = "Machined Bolt";
customizationStrings.Zero = "Variable Zeroing";
customizationStrings.VRec = "Recoil Buffer";
customizationStrings.ITri = "Trigger Job";
customizationStrings.Hipf = "Enhanced Grips";
customizationStrings.IADS = "Barrel Bedding";
customizationStrings.DMag = "Detachable Magazines";
customizationStrings.Bipo = "Bipod";
customizationStrings.FBul = "High Velocity Bullets";
customizationStrings.Long = "Low Drag Rounds";
customizationStrings.ADSS = "Barrel Bedding";
customizationStrings.HRec = "Ported Barrel";
customizationStrings.Heav = "Heavy Load";
customizationStrings.Pene = "Penetrating Shot";
customizationStrings.ExMa = "Extended Magazine";
customizationStrings.Slug = "Slugs";
customizationStrings.Head = "Solid Slug";
customizationStrings.IBip = "Improved Bipod";
customizationStrings.Flas = "Flashless Propellant";
customizationStrings.IROF = "Light Bolt";
customizationStrings.Ince = "Incendiary Bullets";
customizationStrings.Cool = "Chrome Lining";
customizationStrings.Magd = "Polished Action";
customizationStrings.Chok = "Internal Choke";
customizationStrings.ExBe = "Extended Belt";
customizationStrings.Drum = "Double Drum Magazine";
customizationStrings.Gren = "Improved Grenades"
customizationStrings.APCR = "APCR Bullets"
