/**
*  RESPONSIVE MENU
**/
const navToggle = document.getElementsByClassName('navPanelToggle')[0];
const navPanel = document.getElementById('navPanel');
const navClose = navPanel.getElementsByClassName('close')[0];

function navigate(e) {
  e.preventDefault();
  e.stopPropagation();

  const link = e.target;
  // Redirect to href.
  window.setTimeout(() => {
    if (link.getAttribute('target') === '_blank') {
      window.open(link.getAttribute('href'));
    } else {
      window.location.href = link.getAttribute('href');
    }
  }, 200);
  e.currentTarget.classList.remove('visible');
}
function closeNavPanel(e) {
  e.preventDefault();
  e.stopPropagation();
  navPanel.classList.remove('visible');
  document.body.removeEventListener('click', closeNavPanel);
  document.body.removeEventListener('touchend', closeNavPanel);
  navPanel.removeEventListener('click', navigate);
  navPanel.removeEventListener('touchend', navigate);
}
function openNavPanel(e) {
  e.preventDefault();
  e.stopPropagation();
  navPanel.classList.add('visible');
  document.body.addEventListener('click', closeNavPanel);
  document.body.addEventListener('touchend', closeNavPanel);
  navPanel.addEventListener('click', navigate);
  navPanel.addEventListener('touchend', navigate);
}

navToggle.addEventListener('click', openNavPanel);
navToggle.addEventListener('touchend', openNavPanel);
navClose.addEventListener('click', closeNavPanel);
navClose.addEventListener('touchend', closeNavPanel);

/**
* STICKY HEADER IF NOT ON HOMEPAGE
*/
const header = document.getElementById('header');
const banner = document.getElementById('banner');

if (window.location.pathname !== '/') {
  header.classList.remove('alt');
}

/**
* TOGGLE STICKY HEADER ON SCROLL IF ON HOMEPAGE
*/
function stickyScroll(e) {
  if (e.srcElement.location.pathname !== '/') {
    return;
  }
  if (window.pageYOffset > banner.getBoundingClientRect().bottom) {
    header.classList.remove('alt');
  } else {
    header.classList.add('alt');
  }
}
// Scroll handler to toggle classes.
window.addEventListener('scroll', stickyScroll, false);

/**
*  DIRECT USER TO SUBSCRIBE LINK ON OLD CAL-ADAPT SITE
**/
// Action for all subscribe buttons
// Get any Subscribe button on page
const subscribeButtons = Array.prototype.slice.call(document.getElementsByClassName('subscribe-btn'));
// Add event handler to change event on select box
if (subscribeButtons) {
  subscribeButtons.forEach((button) => {
    button.addEventListener(
      'click',
      () => {
        window.location = 'http://cal-adapt.org/blog/subscribe/';
      }
    );
  });
}

/**
*  FILTERING FOR PUBLICATIONS LIST AND FAQS
**/
// Get all list items to be filtered
const itemsToFilter = Array.prototype.slice.call(document.querySelectorAll('#filter-items > li'));
// Get dropdown select box
const selectBox = document.getElementById('filter-term');
// Event handler for select box
function filterItems(itemType) {
  itemsToFilter.forEach((item) => {
    if (item.getAttribute('data-type') === itemType) {
      item.style.display = 'list-item';
    } else if (itemType === 'all') {
      item.style.display = 'list-item';
    } else {
			item.style.display = 'none';
    }
  });
}
// Add event handler to change event on select box
if (selectBox) {
  selectBox.addEventListener(
    'change',
    () => filterItems(selectBox.value)
  );
}


/**
*  FILTERING FOR PUBLICATIONS LIST AND FAQS
**/
// Get all divs that have expandable content and triggers
const expandableItems = Array.prototype.slice.call(document.getElementsByClassName('expander'));
// Event handler to hide/show expandable content
function expandText(item) {
  const triggerLink = item.getElementsByClassName('expander-trigger')[0];
  const triggerContent = item.getElementsByClassName('expander-content')[0];
  triggerLink.classList.toggle('active');
  triggerContent.classList.toggle('show-item');
}
// Add event handler to divs
if (expandableItems) {
  expandableItems.forEach((item) => {
    item.addEventListener(
      'click',
      () => expandText(item)
    );
  });
}
