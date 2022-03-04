
const SYM_FORUMS_URL = 'https://forum.sym.gg/'
const SYM_DISCORD_URL = 'https://discord.gg/Z9vcu46'
const SYM_DATABROWSER_URL = 'https://sym.gg/databrowser'
const SYM_GITHUB_URL = 'https://github.com/miffyli/sym'

// Number of news items available, stored under
// misc/news_items/#.html . This value should be updated
// when new entries for News are made
const SYM_NUM_NEWS_ITEMS = 6
const NUM_NEWS_ITEMS_SHOWN = 6

/*
    This code runs after the page loads all resources.
    Used to set up events and widgets and any other code that needs
    to be run when the page loads.
*/
window.onload = function () {
  const routes = {}
  function addRoute (route, href, loadFn) {
    routes[route] = {
      loadFn: loadFn,
      href: href
    }
  }
  function linkAnchor ($anchor, route) {
    if (Object.prototype.hasOwnProperty.call(routes, route)) {
      $anchor.attr('href', routes[route].href)
      $anchor.click((e) => {
        e.preventDefault()
        routes[route].loadFn()
      })
    } else {
      console.error('Unable to identify route "' + route + '"')
    }
  }
  // Handle click events for the header and footer menus
  addRoute('menuNews', generatePath('sym', 'news'), () => {
    // Only load three latest news for now
    loadPageWithHeader('./pages/misc/news.html', 'News', function () { loadNewestNewsItems(SYM_NUM_NEWS_ITEMS - NUM_NEWS_ITEMS_SHOWN + 1, NUM_NEWS_ITEMS_SHOWN) })
  })
  addRoute('menuForums', SYM_FORUMS_URL, () => openNewTab(SYM_FORUMS_URL))
  addRoute('menuDiscord', SYM_DISCORD_URL, () => openNewTab(SYM_DISCORD_URL))
  addRoute('menuBFV', generatePath('bfv', 'index'), openBFVSelectionPage)
  addRoute('menuBF1', generatePath('bf1', 'index'), openBF1SelectionPage)
  addRoute('menuOtherTitles', generatePath('other', 'index'), openOtherTitlesSelectionPage)
  addRoute('menuDatabrowser', SYM_DATABROWSER_URL, () => openNewTab(SYM_DATABROWSER_URL))
  addRoute('menuAbout', generatePath('sym', 'about'), () => loadPageWithHeader('./pages/misc/about.html', 'About Sym'))
  addRoute('menuFAQ', generatePath('sym', 'faq'), () => loadPageWithHeader('./pages/misc/faq.html', 'Frequently Asked Questions'))
  addRoute('menuContact', generatePath('sym', 'contact-us'), () => loadPageWithHeader('./pages/misc/contact.html', 'Contact Us'))
  addRoute('menuStaff', generatePath('sym', 'staff'), () => loadPageWithHeader('./pages/misc/staff.html', 'Site Staff'))
  addRoute('menuPartners', generatePath('sym', 'partners'), () => loadPageWithHeader('./pages/misc/partners.html', 'Our Partners'))
  addRoute('menuGithub', SYM_GITHUB_URL, () => openNewTab(SYM_GITHUB_URL))
  $.each($('.sym-menu > a'), (idx, navItem) => {
    const $navItem = $(navItem)
    const route = $navItem.attr('id')
    linkAnchor($navItem, route)
  })

  // Handle click for the sym logo, return to home when clicked.
  const bannerRoute = '.sym-banner'
  addRoute(bannerRoute, generatePath('sym', 'home'), () => window.location.replace('index.html'))
  // Handle click for 'JUMP IN WITH BFV' button, loads bfv page.
  const jumpInRoute = '.sym-home-jumpin-btn'
  addRoute(jumpInRoute, generatePath('bfv', 'index'), openBFVSelectionPage)
  // Handle click for 'LEARN MORE' button, loads about page
  const learnMoreRoute = '.sym-main-desc-learnMore-btn'
  addRoute(learnMoreRoute, generatePath('sym, about'), () => loadPageWithHeader('./pages/misc/about.html', 'About Sym'))

  $.each([bannerRoute, jumpInRoute, learnMoreRoute], (idx, selector) => {
    linkAnchor($(selector), selector)
  })
  
  $('.sym-game-datatype').click(function () {
    var clicked = $(this).text();
    var gameId = $(this).parent().attr('id')
  
    switch(clicked){
      case 'General Information':
        updateQueryString(gameId, "general-info")
        break
      case 'Weapon Mechanics':
        updateQueryString(gameId, "weapon-mechanics")
        break
      case 'Weapon Charts':
        updateQueryString(gameId, "charts")
        break
      case 'Weapon Comparison':
        updateQueryString(gameId, "comparison")
        break
      case 'Equipment Data':
        updateQueryString(gameId, "equipment")
        break
      case 'Weapon Builder':
        updateQueryString(gameId, "weapon-builder")
        break      
    }
    history.go(0)
  })
}



/*
  Load given page file with header, and finish
  with callback.

  If callback is undefined, no function is called after
  this.
*/
function loadPageWithHeader (file, header, callback = undefined, versionInfo = '') {
  // Set the header and version info if given
  $('.sym-main-content-version').html(versionInfo)
  $('.sym-main-content').load(file, callback)

  // Scroll back up
  $('html,body').scrollTop(0)
}

/*
    Opens a new tab with the URL specified in the parameter
*/
function openNewTab (url) {
  var win = window.open(url, '_blank')
  if (win) {
    // Browser has allowed it to be opened
    win.focus()
  } else {
    // Browser has blocked it
    alert('Please allow popups for this website')
  }
}

/*
    On new's page, load numItems amount of newest articles
    starting from itemIndex to show on the page
*/
function loadNewestNewsItems (itemIndex, numItems) {
  // Check if we should even load any items
  if (numItems == 0) {
    return
  }

  // Sanity check: Do not load items that do not exist
  if (itemIndex < 1 || itemIndex > SYM_NUM_NEWS_ITEMS) {
    return
  }

  // Setup AJAX request to load and include data
  $.ajax({
    type: 'GET',   
    url: `./pages/misc/news_items/${itemIndex}.html`,
    success : function (data, states, jqXHR)
    {
      $('.sym-news').prepend(jqXHR.responseText.replace("%26", "&"));
      // Recursively load next news items
      loadNewestNewsItems(itemIndex + 1, numItems - 1)
    }
  })
}


/*
    Rounds a number to at most 3 decimal places but will not add trailing zeros
*/
function roundToThree(num) {
  return +(Math.round(num + 'e+3')  + 'e-3')
}

function roundToDecimal(num, decimalSpots){
  return +(Math.round(num + 'e+' + decimalSpots)  + 'e-' + decimalSpots)
}

/*
   Load the stylesheets for each game dynamically because they share a lot of styles.
   Otherwise you would have to rename/de-conflict each entry in the css files and html.
*/
function loadBF2042Stylesheet(){
  $('#chartCSS').attr('href', './pages/bf2042/bf2042_chart.css')
}

function loadBFVStylesheet(){
  $('#chartCSS').attr('href', './pages/bfv/bfv_chart.css')
}

function loadBF1Stylesheet(){
  $('#chartCSS').attr('href', './pages/bf1/bf1_chart.css')
}

function loadBF4Stylesheet(){
  $('#chartCSS').attr('href', './pages/bf4/bf4_chart.css')
}

function loadBFHStylesheet(){
  $('#chartCSS').attr('href', './pages/bfh/bfh_chart.css')
}

function loadBF3Stylesheet(){
  $('#chartCSS').attr('href', './pages/bf3/bf3_chart.css')
}

function loadWarzoneWBStylesheet(){
  $('#chartCSS').attr('href', './pages/warzone/warzone_wb.css')
}

function generatePath(gameValue, pageValue) {
  var params = {game: gameValue, 
    page: pageValue}
  var queryString = $.param(params)
  return window.location.pathname + '?' + queryString;
}

/*
  Writes a query string to the URL given the supplied parameters
  2 or more word values use '-' as in 'weapon-mechanics
*/
function updateQueryString(gameValue, pageValue){
  var newURL = window.location.protocol + "//" + window.location.host + generatePath(gameValue, pageValue)
  window.history.pushState({path:newURL},'',newURL)
}


function exceuteQueryStringParams(){
  const urlParams = new URLSearchParams(window.location.search)
 
  if(urlParams.has("wz-loadout")){
    openWarzoneWeaponBuilderPageFromQueryString()
  } else {
    const game = urlParams.get('game')
    const page = urlParams.get('page')
    console.debug("game: " + game + ", page: " + page)

    switch(game){
      case 'warzone':
        switch(page){
          case 'weapon-builder':
            openWarzoneWeaponBuilderPageFromQueryString()
            break
        }
        break
      case 'bf2042':
        switch(page){
          case 'general-info':
            openOtherTitlesSelectionPageFromQueryString('BF2042 General Information')
            break
          case 'weapon-mechanics':
            openOtherTitlesSelectionPageFromQueryString('BF2042 Weapon Mechanics')
            break
          case 'charts':
            openOtherTitlesSelectionPageFromQueryString('BF2042 Weapon Charts')
            break
          case 'comparison':
            openOtherTitlesSelectionPageFromQueryString('BF2042 Comparison')
            break
        }
        break
      case 'bfv':
        switch(page){
          case 'index':
            openBFVSelectionPage()
            break
          case 'general-info':
            openBFVSelectionPageFromQueryString('General Information')
            break
          case 'weapon-mechanics':
            openBFVSelectionPageFromQueryString('Weapon Mechanics')
            break
          case 'charts':
              openBFVSelectionPageFromQueryString('Weapon Charts')
            break
          case 'comparison':
            openBFVSelectionPageFromQueryString('Weapon Comparison')
            break
          case 'equipment':
            openBFVSelectionPageFromQueryString('Equipment Data')
            break
          case 'vehicles':
            openBFVSelectionPageFromQueryString('Vehicle Data')
            break
        }
        break
      case 'bf1':
        switch(page){
          case 'index':
            openBF1SelectionPage()
            updateQueryString("bf1", "index")
          break
          case 'general-info':
            openBF1SelectionPageFromQueryString('General Information')
            break
          case 'comparison':
            openBF1SelectionPageFromQueryString('Weapon Comparison')
            break
          case 'charts':
            openBF1SelectionPageFromQueryString('Weapon Charts')
            break
          case 'weapon-mechanics':
            openBF1SelectionPageFromQueryString('Weapon Mechanics')
            break
        }
        break
      case 'bfh':
        switch(page){
          case 'comparison':
            openOtherTitlesSelectionPageFromQueryString('BFH Comparison')
            break
          case 'charts':
            openOtherTitlesSelectionPageFromQueryString('BFH Weapon Charts')
            break
        }
        break
      case 'bf4':
        switch(page){
          case 'general-info':
            openOtherTitlesSelectionPageFromQueryString('BF4 General Info')
            break
          case 'comparison':
            openOtherTitlesSelectionPageFromQueryString('BF4 Comparison')
            break
          case 'charts':
            openOtherTitlesSelectionPageFromQueryString('BF4 Weapon Charts')
            break
          case 'weapon-mechanics':
            openOtherTitlesSelectionPageFromQueryString('BF4 Weapon Mechanics')
            break
        }
        break
      case 'bf3':
        switch(page){
          case 'general-info':
            openOtherTitlesSelectionPageFromQueryString('BF3 General Info')
            break
          case 'comparison':
            openOtherTitlesSelectionPageFromQueryString('BF3 Comparison')
            break
          case 'charts':
            openOtherTitlesSelectionPageFromQueryString('BF3 Weapon Charts')
            break
          case 'weapon-mechanics':
            openOtherTitlesSelectionPageFromQueryString('BF3 Weapon Mechanics')
            break
        }
        break
      case 'other':
        switch(page){
          case 'index':
            openOtherTitlesSelectionPage()
            updateQueryString("other", "index")
          break
          case 'bf3-charts':
            openOtherTitlesSelectionPageFromQueryString('BF3 Weapon Charts')
            break
          case 'bf3-comparison':
            openOtherTitlesSelectionPageFromQueryString('BF3 Comparison')
            break
          case 'bf3-general-info':
            openOtherTitlesSelectionPageFromQueryString('BF3 General Info')
            break
          case 'bf3-weapon-mechanics':
            openOtherTitlesSelectionPageFromQueryString('BF3 Weapon Mechanics')
            break
          case 'bf4-weapon-mechanics':
            openOtherTitlesSelectionPageFromQueryString('BF4 Weapon Mechanics')
            break
          case 'bf4-general-info':
            openOtherTitlesSelectionPageFromQueryString('BF4 General Info')
            break
          case 'bf4-comparison':
            openOtherTitlesSelectionPageFromQueryString('BF4 Comparison')
            break
          case 'bf4-charts':
            openOtherTitlesSelectionPageFromQueryString('BF4 Weapon Charts')
            break
          case 'bfh-comparison':
            openOtherTitlesSelectionPageFromQueryString('BFH Comparison')
            break
          case 'bfh-charts':
            openOtherTitlesSelectionPageFromQueryString('BFH Weapon Charts')
              break
        }
        break
      case 'sym':
        switch(page){
          case 'news':
            loadPageWithHeader('./pages/misc/news.html', 'News', function() { loadNewestNewsItems(1, 3) })
            updateQueryString("sym", "news")
            break
          case 'about':
            loadPageWithHeader('./pages/misc/about.html', 'About Sym')
            updateQueryString("sym", "about")
            break
          case 'faq':
            loadPageWithHeader('./pages/misc/faq.html', 'Frequently Asked Questions')
            updateQueryString("sym", "faq")
            break
          case 'contact-us':
            loadPageWithHeader('./pages/misc/contact.html', 'Contact Us')
            updateQueryString("sym", "contact-us")
            break
          case 'staff':
            loadPageWithHeader('./pages/misc/staff.html', 'Site Staff')
            updateQueryString("sym", "staff")
            break
          case 'partners':
            loadPageWithHeader('./pages/misc/partners.html', 'Our Partners')
            updateQueryString("sym", "partners")
            break
        }
        break
      default:
        $(".sym-main-content-home").show();
    }
  }
  
  $(".sym-footer").show();
}

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
        $(".dropdown-content > div").off("click");
      }
    }
  }
}

$(document).ready(function() {
  exceuteQueryStringParams()
});
