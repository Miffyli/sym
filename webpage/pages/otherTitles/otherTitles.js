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
  
  function openOtherTitlesSelectionPageFromQueryString (pageStr){
    bf1PageToLoad = pageStr
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
    //loadBF1Stylesheet()
    $('.sym-pageSelections > div').click(function () {
      var clicked = $(this).attr('id')
      var pageName
      if (clicked === 'otherTitles-mainPageSelector') {
        pageName = 'Index'
      } else if (clicked === 'bf3-chartPageSelector') {
        pageName = 'BF3 Weapon Charts'
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
    }
  }

  function openOtherTitlesIndexPage () {
    $('.otherTitles-main-content').load('./pages/otherTitles/otherTitles_index.html', otherTitlesInitializeIndexPage)
  }

  function openBF3ChartPage(){
    if (BF3DataLoaded === false) {
      BF3SelectedPage = "BF3_CHART"
      BF3LoadWeaponData()
    } else {
      loadBF3ChartPage()
    }
  }  

  function BF3LoadWeaponData () {
    $.getJSON(BF3_DATA).done(BF3LoadSuccessCallback).fail(function (jqxhr, textStatus, error) {
      console.log('Loading BF1 data failed: ' + textStatus + ' , ' + error)
    })
  }

function openOtherTitlesSelectionPageFromQueryString (pageStr){
  otherTitlesPageToLoad = pageStr
  loadPageWithHeader('./pages/otherTitles/otherTitles_header.html', 'Other Titles', OtherTitlesLoadPageFromQueryString, OTHER_TITLES_VERSION_STRING)
}

function OtherTitlesLoadPageFromQueryString(){
  otherTitlesSetupPageHeader()
  otherTitlesOpenPageByName(otherTitlesPageToLoad)
}