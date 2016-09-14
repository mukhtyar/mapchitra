// If JavaScript is enabled remove 'no-js' class and give 'js' class
var html = document.getElementsByTagName('html')[0];
html.classList.remove('no-js');
html.classList.add('js');


// When DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {

	/* --------------------------------------------------------	
	Portfolio 
   --------------------------------------------------------	*/
	var projectsFilter = document.getElementsByClassName('portfolio-filter')[0];
	var filters = Array.prototype.slice.call(projectsFilter.querySelectorAll('li'));

	var projectsContainer = document.getElementsByClassName('portfolio-items')[0];
	var projects = Array.prototype.slice.call(projectsContainer.querySelectorAll('.project'));

	function filterProjects(e) {
		e.preventDefault();
		e.stopPropagation();

		var el = e.currentTarget;
		removeClassFromSiblings(el);
		el.classList.add('active');
		var filterTerm = el.firstChild.getAttribute('data-filter');
		projects.forEach(function (item) {
			if (filterTerm === 'all') {
				item.classList.remove('hidden');
				return;
			}
			if (item.getAttribute('data-tags').indexOf(filterTerm) > -1) {
				item.classList.remove('hidden');
			} else {
			  	item.classList.add('hidden');
			}
		});
	}
	// Add event handler to change event on select box
	filters.forEach(function(filter) {
	  filter.addEventListener('click', filterProjects);
	});

	function removeClassFromSiblings(el, className = 'active') {
	  Array.prototype.filter.call(el.parentNode.children, function (child) {
	    if (child !== el) {
	      child.classList.remove(className);
	    }
	  });
	}

	/* --------------------------------------------------------	
	Main
   	--------------------------------------------------------	*/
   	var main = document.getElementById('main');
   	var mainContent = document.getElementsByClassName('content')[0]
	var pattern = Trianglify({
	  height: main.offsetHeight,
	  width: main.offsetWidth,
	  x_colors: 'Greys',
	  y_colors: 'YlGnBu',
	  cell_size: 40
	});

	main.insertBefore(pattern.canvas(), mainContent);


});

