const OTHER_TITLES_VERSION_STRING = ""
// Keeps track of which page to load when loading from a querystring
var otherTitlesPageToLoad = ""


/*
  Load the BF1 selector page that contains the buttons to allow
  the user to select which page to navigate to (chart, comp, etc...).
*/
function openOtherTitlesSelectionPage () {
    loadPageWithHeader('./pages/otherTitles/otherTitles_header.html', 'Other Titles', initializeOtherTitlesSelection, "")
  }

/*
  Add handlers for the click events for the bf1 selector page and open
  the entry page for BF1
*/
function initializeOtherTitlesSelection () {
  otherTitlesSetupPageHeader()
  openOtherTitlesIndexPage()
}

/*
  Add handlers for the click events for the bf1 index page
*/
function otherTitlesInitializeIndexPage(){
  $('.indexPageItem').click(function () {
      var itemClicked = $(this).find("h4").text()
      otherTitlesOpenPageByName(itemClicked)
  })
}

function otherTitlesSetupPageHeader(){
  $('.sym-pageSelections > div').click(function () {
    var clicked = $(this).attr('id')
    var pageName
    if (clicked === 'otherTitles-mainPageSelector') {
      pageName = 'Index'
    } else if (clicked === 'bf3-chartPageSelector') {
      pageName = 'BF3 Weapon Charts'
    } else if (clicked === 'bf3-comparisonPageSelector') {
      pageName = 'BF3 Comparison'
    } else if (clicked === 'bf3-generalInfoPageSelector') {
      pageName = 'BF3 General Information'
    } else if (clicked === 'bf3-weaponPageSelector') {
      pageName = 'BF3 Weapon Mechanics'
  	} else if (clicked === 'bf4-weaponPageSelector') {
      pageName = 'BF4 Weapon Mechanics'
	  } else if (clicked === 'bf4-chartPageSelector') {
      pageName = 'BF4 Weapon Charts'
    } else if (clicked === 'bf4-comparisonPageSelector') {
      pageName = 'BF4 Comparison'
    } else if (clicked === 'bf4-generalInfoPageSelector') {
      pageName = 'BF4 General Info'
    } else if (clicked === 'bfh-chartPageSelector') {
      pageName = 'BFH Weapon Charts'
    } else if (clicked === 'bfh-comparisonPageSelector') {
      pageName = 'BFH Comparison'
    }
    otherTitlesOpenPageByName(pageName)
  })
}

/*
  Main hub for opening different pages based on their name.
  Handles coloring of the buttons etc
*/
function otherTitlesOpenPageByName(pageName) {
  // Remove highlighting
  $('.sym-pageSelections > div').removeClass('selected-selector')
  $('.otherTitles-main-content').html("<div class='sym-loading'>Loading...</div>")
  // Select right page according to pageName, highlight its
  // button and open the page
  if (pageName === 'Index') {
    $('#otherTitles-mainPageSelector').addClass('selected-selector')
    openOtherTitlesIndexPage()
    updateQueryString("other", "index")
  } else if (pageName === 'BF3 Weapon Charts') {
    $('#bf3-chartPageSelector').addClass('selected-selector')
    openBF3ChartPage()
    updateQueryString("other", "bf3-charts")
  } else if (pageName === 'BF3 Weapon Mechanics') {
    $('#bf3-weaponPageSelector').addClass('selected-selector')
    openBF3WeaponInfoPage()
    updateQueryString("other", "bf3-weapon-mechanics")
  } else if (pageName === 'BF3 Comparison') {
    $('#bf3-comparisonPageSelector').addClass('selected-selector')
    openBF3ComparisonPage()
    updateQueryString("other", "bf3-comparison")
  } else if (pageName === 'BF3 General Info') {
    $('#bf3-generalInfoPageSelector').addClass('selected-selector')
    openBF3GeneralInfoPage()
    updateQueryString("other", "bf3-general-info")
  } else if (pageName === 'BF4 Comparison') {
    $('#bf4-comparisonPageSelector').addClass('selected-selector')
    openBF4ComparisonPage()
    updateQueryString("other", "bf4-comparison")
  } else if (pageName === 'BF4 Weapon Mechanics') {
    $('#bf4-weaponPageSelector').addClass('selected-selector')
    openBF4WeaponInfoPage()
    updateQueryString("other", "bf4-weapon-mechanics")
  } else if (pageName === 'BF4 Weapon Charts') {
    $('#bf4-chartPageSelector').addClass('selected-selector')
    openBF4ChartPage()
    updateQueryString("other", "bf4-charts")
  } else if (pageName === 'BF4 General Info') {
    $('#bf4-generalInfoPageSelector').addClass('selected-selector')
    openBF4GeneralInfoPage()
    updateQueryString("other", "bf4-general-info")
  } else if (pageName === 'BFH Comparison') {
    $('#bfh-comparisonPageSelector').addClass('selected-selector')
    openBFHComparisonPage()
    updateQueryString("other", "bfh-comparison")
  } else if (pageName === 'BFH Weapon Charts') {
    $('#bfh-chartPageSelector').addClass('selected-selector')
    openBFHChartPage()
    updateQueryString("other", "bfh-charts")
  }
}

function openOtherTitlesIndexPage () {
  $('.otherTitles-main-content').load('./pages/otherTitles/otherTitles_index.html', otherTitlesInitializeIndexPage)
}

function openOtherTitlesSelectionPageFromQueryString (pageStr){
  otherTitlesPageToLoad = pageStr
  loadPageWithHeader('./pages/otherTitles/otherTitles_header.html', 'Other Titles', OtherTitlesLoadPageFromQueryString, OTHER_TITLES_VERSION_STRING)
}

function OtherTitlesLoadPageFromQueryString(){
  //otherTitlesSetupPageHeader()
  otherTitlesOpenPageByName(otherTitlesPageToLoad)
}