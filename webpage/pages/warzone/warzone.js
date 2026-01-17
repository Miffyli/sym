// Path to datafile
const WARZONE_DATA = './pages/warzone/data/warzone.json'

// Manual dates when the data or pages have been modified.
// In format "[day] [month three letters] [year four digits]"
// e.g. 2nd Jan 2019
const WARZONE_DATA_DATE = '7th October 2022'
const WARZONE_PAGE_DATE = '15th October 2022'

// Total version string displayed under title
const WARZONE_VERSION_STRING = `Latest updates<br>Page: ${WARZONE_PAGE_DATE}<br>Data: ${WARZONE_DATA_DATE}`

function openWarzoneWeaponBuilderPageFromQueryString(){
  loadPageWithHeader('./pages/warzone/warzone_wb.html', 
                     '', 
                     WarzoneLoadWeaponData, 
                     WARZONE_VERSION_STRING)
}

function openWarzoneGameplaMechanicsPageFromQueryString(){
  loadPageWithHeader('./pages/warzone/wz_dataMechanics.html', 
                     'Call of Duty: Warzone Gameplay Mehanics', 
                     $.noop, 
                     WARZONE_VERSION_STRING)
}

function openWarzonePatchNotesPageFromQueryString(){
  loadPageWithHeader('./pages/warzone/wz_patchnotes.html', 
                     '', 
                     $.noop, 
                     WARZONE_VERSION_STRING)
}
