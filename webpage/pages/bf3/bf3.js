// Path to datafile
const BF3_DATA = './pages/bf3/data/bf3.json'
// Keeps track of which page to load after the data is loaded.
var BF3SelectedPage = ""
// A flag to tell if we have loaded BF3 data already
var BF3DataLoaded = false

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
