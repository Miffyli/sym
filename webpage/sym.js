
const SYM_FORUMS_URL = 'https://forum.sym.gg/'
const SYM_DISCORD_URL = 'https://discord.gg/Z9vcu46'
const SYM_DATABROWSER_URL = 'https://sym.gg/databrowser'
const SYM_GITHUB_URL = 'https://github.com/miffyli/sym'

// Number of news items available, stored under
// misc/news_items/#.html . This value should be updated
// when new entries for News are made
const SYM_NUM_NEWS_ITEMS = 1

/*
    This code runs after the page loads all resources.
    Used to set up events and widgets and any other code that needs
    to be run when the page loads.
*/
window.onload = function () {
  // Handle click events for the header and footer menus
  $('.sym-menu > span').click(function () {
    var clicked = $(this).attr('id')

    if (clicked === 'menuNews') {
      // Only load three latest news for now
      loadPageWithHeader('./pages/misc/news.html', 'News', function() { loadNewestNewsItems(1, 3) })
    } else if (clicked === 'menuForums') {
      openNewTab(SYM_FORUMS_URL)
    } else if (clicked === 'menuDiscord') {
      openNewTab(SYM_DISCORD_URL)
    } else if (clicked === 'menuBFV') {
      openBFVSelectionPage()
    } else if (clicked === 'menuBF1') {
      openBF1SelectionPage()
    } else if (clicked === 'menuDatabrowser') {
      openNewTab(SYM_DATABROWSER_URL)
    } else if (clicked === 'menuAbout') {
      loadPageWithHeader('./pages/misc/about.html', 'About Sym')
    } else if (clicked === 'menuFAQ') {
      loadPageWithHeader('./pages/misc/faq.html', 'Frequently Asked Questions')
    } else if (clicked === 'menuContact') {
      loadPageWithHeader('./pages/misc/contact.html', 'Contact Us')
    } else if (clicked === 'menuStaff') {
      loadPageWithHeader('./pages/misc/staff.html', 'Site Staff')
    } else if (clicked === 'menuGithub') {
      openNewTab(SYM_GITHUB_URL)
    }
  })

  // Handle click for the sym logo, return to home when clicked.
  $('.sym-banner').click(function () {
    window.location.replace('index.html')
  })

  // Handle click for 'JUMP IN WITH BFV' button, loads bfv page.
  $('.sym-home-jumpin-btn').click(function () {
    openBFVSelectionPage()
  })

  // Handle click for 'LEARN MORE' button, loads about page
  $('.sym-main-desc-learnMore-btn').click(function () {
    loadPageWithHeader('./pages/misc/about.html', 'About Sym')
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
  $('.sym-main-content-header').html(header)
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
      $('.sym-news').append(jqXHR.responseText);
      // Recursively load next news items
      loadNewestNewsItems(itemIndex + 1, numItems - 1)
    }
  })
}

/*
    Rounds a number to at most 3 decimal places but will not add trailing zeros
*/
function roundToThree(num) {
  return +(Math.round(num + 'e+3')  + 'e-3');
}

function roundToDecimal(num, decimalSpots){
  return +(Math.round(num + 'e+' + decimalSpots)  + 'e-' + decimalSpots);
}
