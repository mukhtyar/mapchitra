var tileProviders = {
  mapboxSatellite: tileUrl("http://{s}.tiles.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibXVraHR5YXIiLCJhIjoiZHdCSFRKNCJ9.-bpAlV1GXhC5qWRpI8QOVw"),
  cartoPositron: tileUrl("http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"),
  cartoPositronLabels: tileUrl("http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png"),
  slr: tileUrl("http://api.cal-adapt.org/tiles/slr_{slrArea}_{slrScenario}_jdr/{z}/{x}/{y}.png?style=slr")
}

var pi = Math.PI,
    tau = 2 * pi;

var mapWindow = document.getElementsByClassName('map')[0];
var width = mapWindow.offsetWidth;
var height = Math.max(mapWindow.offsetHeight, 600);

//Opacity
const slrOpacity = 0.8;
const basemapOpacity = 0.5;

// Initialize the projection to fit the world in a 1×1 square centered at the origin.
var projection = d3.geoMercator()
    .scale(1 / tau)
    .translate([0, 0]);

var path = d3.geoPath()
    .projection(projection);

var tile = d3.tile()
    .size([width, height]);

var zoom = d3.zoom()
    .scaleExtent([1 << 16, 1 << 24])
    .on("zoom", zoomed);

var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height);


var defs = svg.append("defs");

// Add filter
filterBasemap = defs.append("filter").attr("id", "basemapFilter").append("feColorMatrix");

var matrix = [
  [ 0.3333, 0.3333,  0.3333,  0,  0 ],
  [ 0.3333, 0.3333,  0.3333,  0,  0 ],
  [ 0.3333, 0.3333,  0.3333,  0,  0 ],
  [ 0,  0,  0,  1,  0 ],
];

filterBasemap.attr("type", "saturate").attr("values", 0);
//filterBasemap.attr("type", "matrix").attr("values", matrix.join(' '));

var satelliteImages = tileImages(tile).url(tileProviders.mapboxSatellite);
var satelliteRaster  = svg.append("g")
  .classed('satellite', true)
  .attr("clip-path", "url(#clip)")
  .attr("filter", "url(#basemapFilter)")
  .append("g")
  .style('opacity', basemapOpacity);

var labelImages = tileImages(tile).url(tileProviders.cartoPositronLabels);
var labelRaster  = svg.append("g")
  .classed('maplabels', true)
  .attr("clip-path", "url(#clip)")
  .append("g");


var slrImages = tileImages(tile).url(tileProviders.slr);
var slrRaster  = svg.append("g")
  .classed('slr', true)
  .style('opacity', slrOpacity)
  .append("g");

var countiesClipPath = defs.append("path").attr("id", "land");
var countiesLabels = svg.append("g").attr('class', 'labels');

defs.append("clipPath")
      .attr("id", "clip")
    .append("use")
      .attr("xlink:href", "#land");

svg.append("use")
      .attr("xlink:href", "#land")
      .attr("class", "stroke");


// Compute the projected initial center.
var center = projection([-122.244, 37.843]);

//countiesClipPath url
var url='http://api.cal-adapt.org/api/counties/?intersects={%22type%22:%22Polygon%22,%22coordinates%22:[[[-122.776880212876961,38.340314875516867],[-121.69175774422628,38.32283628487383],[-121.718794306364515,37.338284374515446],[-122.796071544122455,37.36843682447212],[-122.796071544122455,37.36843682447212],[-122.776880212876961,38.340314875516867]]]}&srs=4326';

function draw(zoomLevel) {
  d3.json(url, function(error, counties) {
  if (error) throw error;
  console.log(counties);



  // Apply a zoom transform equivalent to projection.{scale,translate,center}.
  svg
      .call(zoom)
      .call(zoom.transform, d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(1 << zoomLevel)
          .translate(-center[0], -center[1]));

  countiesClipPath
      .attr("d", path(counties));

/*  countiesLabels.selectAll('.label').data(counties.features).enter().append('text')
      .attr("class", "label")
      .attr('transform', function(d) {
        console.log(path.centroid(d));
          return "translate(" + path.centroid(d) + ")";
      })
      .style('text-anchor', 'middle')
      .text(function(d) {
          return d.properties.name
      });*/
  });
}

draw(17);

function zoomed() {
  var transform = d3.event.transform;
  var tiles;

  if (transform) {
    tiles = tile
      .scale(transform.k)
      .translate([transform.x, transform.y])
      ();
  }


  countiesClipPath
      .attr("transform", transform)
      .style("stroke-width", 1 / transform.k);

  var currentZoom = Math.max(Math.log(tile.scale()) / Math.LN2 - 8, 0);
  satelliteRaster.call(satelliteImages);
  if (currentZoom > 9.5) {
    labelRaster.call(labelImages);
  }
  slrRaster.call(slrImages);
}

function stringify(scale, translate) {
  var k = scale / 256, r = scale % 1 ? Number : Math.round;
  return "translate(" + r(translate[0] * scale) + "," + r(translate[1] * scale) + ") scale(" + k + ")";
}

var slrScenario = '0_0m';
var slrArea = 'sfbay';

function tileUrl(pattern){
  return function (d){
    return pattern
      .replace("{x}", d[0])
      .replace("{y}", d[1])
      .replace("{z}", d[2])
      .replace("{s}", ["a", "b", "c"][Math.random() * 3 | 0])
      .replace("{slrArea}", slrArea)
      .replace("{slrScenario}", slrScenario);
  };
}


  
function tileImages(tile){
  
  var url = tileProviders.mapboxSatellite;
    
  var images = function (raster){

    var tiles = tile();

    var image = raster
        .attr("transform", "scale(" + tiles.scale + ")translate(" + tiles.translate + ")")
      .selectAll("image")
        .data(tiles, function(d) { return d; });

    image.exit()
        .remove();

    image.enter().append("image")
        .attr("xlink:href", url)
        .attr("width", 1)
        .attr("height", 1)
        .attr("opacity", 0)
        .attr("x", function(d) { return d[0]; })
        .attr("y", function(d) { return d[1]; })
        .on("load", function (){
          d3.select(this).transition().duration(500)
            .attr("opacity", 1);
        })
  };
  
  images.url = function (_){
    return arguments.length ? (url = _, images) : url;
  }
  
  return images;
}
// Sliders
var slrSlider = document.querySelectorAll('#slr-opacity .range-slider')[0];
noUiSlider.create(slrSlider, {
  start: 0.8,
  step: 0.1,
  range: {
    min: 0,
    max: 1,
  },
});
slrSlider.noUiSlider.on('change', (value) => {
  updateSlrOpacity(parseFloat(value));
});

var basemapSlider = document.querySelectorAll('#basemap-opacity .range-slider')[0];
noUiSlider.create(basemapSlider, {
  start: 0.5,
  step: 0.1,
  range: {
    min: 0,
    max: 1,
  },
});
basemapSlider.noUiSlider.on('change', (value) => {
  updateBasemapOpacity(parseFloat(value));
});

function updateSlrOpacity(opacity) {
  var rects = document.querySelectorAll('.cell rect');
  rects.forEach(function(el){
    console.log(el);
    el.style.opacity = opacity;
  });
  slrRaster.style('opacity', opacity);
}

function updateBasemapOpacity(opacity) {
  satelliteRaster.style('opacity', opacity);
}

//Legend
var linear = d3.scaleOrdinal()
  .domain(['0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '>4' ])
  .range([ '#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58']);


svg.append("g")
  .attr("class", "legendLinear")
  .attr("transform", "translate(20,20)");

var legendLinear = d3.legendColor()
  .shapeWidth(20)
  .scale(linear)
  .title('Depth of Flooding (meters)')

svg.select(".legendLinear")
  .call(legendLinear);

var rects = document.querySelectorAll('.cell rect');
rects.forEach(function(el){
  el.style.opacity = slrOpacity;
});

/**
*  CHANGE SCENARIO
**/
const scenarioOptsContainer = document.getElementsByClassName('slr-scenario')[0];

function changeScenario(e) {
  e.preventDefault();
  e.stopPropagation();

  const input = e.currentTarget.querySelector('input');
  slrScenario = input.value;
  slrRaster.selectAll('image').remove();
  slrRaster.call(slrImages);
  input.checked = true;
}

if (scenarioOptsContainer) {
  var scenarioOpts = scenarioOptsContainer.querySelectorAll('li');
  Array.from(scenarioOpts).forEach((item) => {
    item.addEventListener('click', changeScenario);
    if (item.checked) {
      console.log(input.value);
    }
  });
}

/**
*  CHANGE LOCATION
**/
function removeClassFromSiblings(el, className = 'active') {
  Array.prototype.filter.call(el.parentNode.children, function (child) {
    if (child !== el) {
      child.classList.remove(className);
    }
  });
}

const locationOptsContainer = document.getElementsByClassName('location')[0];

function changeLocation(e) {
  e.preventDefault();
  e.stopPropagation();

  // Remove active class from siblings
  var item = e.currentTarget;
  removeClassFromSiblings(item, 'active');
  item.classList.add('active');

  const input = item.querySelector('input');
  slrArea = input.value;
  console.log(slrArea);
  if (slrArea === 'sfbay') {
    center = projection([-122.244, 37.843]);
    url='http://api.cal-adapt.org/api/counties/?intersects={%22type%22:%22Polygon%22,%22coordinates%22:[[[-122.776880212876961,38.340314875516867],[-121.69175774422628,38.32283628487383],[-121.718794306364515,37.338284374515446],[-122.796071544122455,37.36843682447212],[-122.796071544122455,37.36843682447212],[-122.776880212876961,38.340314875516867]]]}&srs=4326';
    d3.select('.satellite').attr("clip-path", "url(#clip)");
    d3.select('.maplabels').attr("clip-path", "url(#clip)");
    slrRaster.selectAll('image').remove();
    draw(17);
  } else if (slrArea === 'delta') {
    center = projection([-121.6735, 38.186]);
    url='http://api.cal-adapt.org/api/counties/?intersects={%22type%22:%22Polygon%22,%22coordinates%22:[[[-122.1844482421875,37.900865092570065],[-122.1844482421875,38.634036452919226],[-121.19018554687499,38.634036452919226],[-121.19018554687499,37.900865092570065],[-122.1844482421875,37.900865092570065]]]}&srs=4326';
    d3.select('.satellite').attr("clip-path", "url(#clip)");
    d3.select('.maplabels').attr("clip-path", "url(#clip)");
    slrRaster.selectAll('image').remove();
    draw(17);
  } else if (slrArea === 'coast') {
    url='http://api.cal-adapt.org/api/counties/?intersects={%22type%22:%22Polygon%22,%22coordinates%22:[[[-124.69482421875, 41.902277040963696 ], [-123.85986328124999, 41.902277040963696 ], [-123.1787109375, 38.8225909761771 ], [-121.77246093750001, 37.63163475580643 ], [-118.91601562499999, 34.66935854524545 ], [-117.158203125, 33.87041555094183 ], [-116.89453125, 32.879587173066305 ], [-118.7841796875, 32.54681317351517 ], [-121.904296875, 33.76088200086917 ], [-125.3759765625, 39.198205348894795 ], [-124.69482421875, 41.902277040963696 ] ] ] }&srs=4326'; 
    center = projection([-118.22525024414062,33.774866743820056]);
    d3.select('.satellite').attr("clip-path", "");
    d3.select('.maplabels').attr("clip-path", "");
    slrRaster.selectAll('image').remove();
    draw(20);
  }


  input.checked = true;
}

if (locationOptsContainer) {
  var locationOpts = locationOptsContainer.querySelectorAll('li');
  Array.from(locationOpts).forEach((item) => {
    item.addEventListener('click', changeLocation);
    if (item.checked) {
      console.log(input.value);
    }
  });
}