
// Path to datafile
const BF3_DATA = './pages/bf3/data/bf3.json'
// Keeps track of which page to load after the data is loaded.
var BF3SelectedPage = ""
// Keeps track of which page to load when loading from a querystring
var bf3PageToLoad = ""
// A flag to tell if we have loaded BF1 data already
var BF3DataLoaded = false


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
  function otherTitlesinitializeIndexPage(){
    $('.indexPageItem').click(function () {
        var itemClicked = $(this).find("h4").text()
        OtherTitlesOpenPageByName(itemClicked)
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
      OtherTitlesOpenPageByName(pageName)
    })
  }

  
/*
  Main hub for opening different pages based on their name.
  Handles coloring of the buttons etc
*/
function OtherTitlesOpenPageByName(pageName) {
    // Remove highlighting
    $('.sym-pageSelections > div').removeClass('selected-selector')
    // Select right page according to pageName, highlight its
    // button and open the page
    if (pageName === 'Index') {
      $('#otherTitles-mainPageSelector').addClass('selected-selector')
      openOtherTItlesIndexPage()
      updateQueryString("other", "index")
    } else if (pageName === 'BF3 Weapon Charts') {
      $('#bf3-chartPageSelector').addClass('selected-selector')
      openBF3ChartPage()
      updateQueryString("bf3", "charts")
    }
  }

  function openOtherTitlesIndexPage(){

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

  /*
  Function to handle JSON data upon receiving it:
  Parse JSON data and preprocess it into different
  arrays.
*/
function BF3LoadSuccessCallback (data) {
  BF3WeaponData = data
  BF1DataLoaded = true

  loadBF3Stylesheet()

  // Proceed to appropriate page
  if (BF3SelectedPage === "BF3_CHART"){
    loadBF3ChartPage()
  } else if (BF1SelectedPage === "BF3_COMPARISON"){
    //loadBF1ComparisonPage()
  }
}

function loadBF3ChartPage(){
  $('.otherTitles-main-content').load('./pages/bf3/bf3_chart.html', BF3initializeChartPage)
}