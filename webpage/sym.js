
const SYM_FORUMS_URL = 'https://forum.sym.gg/'
const SYM_DISCORD_URL = 'https://discord.gg/Z9vcu46'
const SYM_DATABROWSER_URL = 'https://sym.gg/databrowser'

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
      loadPageWithHeader('./pages/misc/news.html', '')
    } else if (clicked === 'menuForums') {
      openNewTab(SYM_FORUMS_URL)
    } else if (clicked === 'menuDiscord') {
      openNewTab(SYM_DISCORD_URL)
    } else if (clicked === 'menuBFV') {
      openBFVSelectionPage()
    } else if (clicked === 'menuBF1') {
      initializeBF1Page()
    } else if (clicked === 'menuDatabrowser') {
      openNewTab(SYM_DATABROWSER_URL)
    } else if (clicked === 'menuAbout') {
      loadPageWithHeader('./pages/misc/about.html', 'About')
    } else if (clicked === 'menuFAQ') {
      loadPageWithHeader('./pages/misc/faq.html', 'Frequently Asked Questions')
    } else if (clicked === 'menuContact') {
      loadPageWithHeader('./pages/misc/contact.html', 'Contact')
    } else if (clicked === 'menuTeam') {
      loadPageWithHeader('./pages/misc/team.html', 'Team')
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
}

/*
  Load given page file with header, and finish
  with callback.

  If callback is undefined, no function is called after
  this.
*/
function loadPageWithHeader (file, header, callback = undefined) {
  // Set the header
  $('.sym-main-content-header').html(header)
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
