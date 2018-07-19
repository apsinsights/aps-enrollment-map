# APS Enrollment Map: How-To

This page has both a school lookup tool and performance color coding. See the [finished product here](https://apsinsights.org/enrollment-map/). The page is built in Javascript and uses [Leaflet.js](https://leafletjs.com/) for mapping. Read-on to learn how to build it:

## Create map

Start by including leaflet files in your header and adding a div for the map:

```html
<head>
 <link rel="stylesheet" href="https://unpkg.com/leaflet@1.3.3/dist/leaflet.css"
   integrity="sha512-Rksm5RenBEKSKFjgI3a41vrjkw4EVPlJ3+OiI65vTjIdo9brlAacEuKOiQ5OFh7cOI1bkDwLqdLw3Zg0cRJAAQ=="
   crossorigin=""/>
	
 <!-- Make sure you put this AFTER Leaflet's CSS -->
 <script src="https://unpkg.com/leaflet@1.3.3/dist/leaflet.js"
   integrity="sha512-tAGcCfR4Sc5ZP5ZoVz0quoZDYX5aCtEm/eu1KhSLj2c9eFrylXZknQYmxUssFaVJKvvc0dJQixhGjG2yXWiV9Q=="
   crossorigin=""></script>
</head>

<body>
	<div id="mapid" style="height: 500px";></div>
</body>
```

Next, [initialize a Leaflet map](https://leafletjs.com/examples/quick-start/):

```javascript
var performMap = L.map('mapid').setView([33.77, -84.41], 11);
//"mapid" is the name of the div where the map will go
//"33.77,-84.11" are lat/long to center the map in Atlanta, "11" is the zoom level

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	attribution: '<a href="http://openstreetmap.org">OpenStreetMap</a> | <a href="http://mapbox.com">Mapbox</a>',
	maxZoom: 18,
	id: 'mapbox.streets-basic', //see free options here: https://www.mapbox.com/api-documentation/#maps
	accessToken: 'your.mapbox.access.token', //enter your mapbox access token here
}).addTo(performMap);
```

The map will look  something like this:

![](https://github.com/johnkeltz/aps-enrollment-map/blob/master/images/Initialize%20Map.PNG)

## Add polygons

Next, upload school zone shapes as a geojson file and use the Leaflet function [GeoJSON](https://leafletjs.com/reference-1.3.2.html#geojson) to plot said shapes:

```javascript
	$.getJSON("https://apsinsights.org/documents/2018/05/enrollment-map-elementary-zones.txt",function(zones){
		mapFill = L.geoJson(zones  , {
			style: colorMap,
			onEachFeature: mapTips
		}).addTo(performMap); 
		mapFill.bringToBack();
	})
```
With the [JSON Viewer extension](https://chrome.google.com/webstore/detail/json-viewer/gbmdgpbipfallnflgajpaliibnhdgobh) in chrome you can view the [enrollment-map-elementary-zones](https://apsinsights.org/documents/2018/05/enrollment-map-elementary-zones.txt) file that we're loading above.

To create the GeoJSON file, we used the [geojsonio](https://github.com/ropensci/geojsonio) package in R to load a school zone shapefile and then merge it with performance data. GIS programs like arcGIS or QGIS can also do this, but the R code is convenient to quickly refresh the file each time new performance data is released.

In the code snippet above, we're passing functions for the **style** and **onEachFeature** options. Style is determined by the function **colorMap**, shown below. ColorMap gives a color to each school shape according to the school's data. Notice that the colorMap function refers to data, such as "feature.properties.ccrpi_score". These data are included in the geojson file that we loaded above.

```javascript
var metric ='CCRPI';
//Set metric to "CCRPI" so a value is set on page load. We'll change this later when we build a filter to select a metric.

function colorMap(feature){
		var fillColor,
		ccrpi = Math.round(feature.properties.ccrpi_score*10)/10;
		if (metric == 'CCRPI'){
			if( ccrpi >= 90 ) fillColor = "#58A667";
			else if ( ccrpi >= 80 ) fillColor = "#72C282";
			else if ( ccrpi >= 70 ) fillColor = "#A0D797";
			else if ( ccrpi >= 60 ) fillColor = "#FFE183";
			else if ( ccrpi >= 50 ) fillColor = "#FF856E";
			else if ( ccrpi > 0 ) fillColor = "#C43948";
			else fillColor = "#888888";}
		//these other options will be used later
		else if (metric == 'Milestones'){
			milestones = Math.round(feature.properties.milestones*100);
			if( milestones >= 75 ) fillColor = "#58A667";
			else if ( milestones >= 60 ) fillColor = "#72C282";
			else if ( milestones >= 45 ) fillColor = "#A0D797";
			else if ( milestones >= 30 ) fillColor = "#FFE183";
			else if ( milestones >= 15 ) fillColor = "#FF856E";
			else if ( milestones > 0 ) fillColor = "#C43948";
			else fillColor = "#888888";}
		else if (metric == 'Growth'){
			growth = Math.round(feature.properties.sgp*100);
			if( growth >= 75 ) fillColor = "#58A667";
			else if ( growth >= 70 ) fillColor = "#72C282";
			else if ( growth >= 65 ) fillColor = "#A0D797";
			else if ( growth >= 60 ) fillColor = "#FFE183";
			else if ( growth >= 55 ) fillColor = "#FF856E";
			else if ( growth > 0 ) fillColor = "#C43948";
			else fillColor = "#888888";}
		else if (metric == 'Climate'){
			climate = feature.properties.star_rating;
			if( climate == 5 ) fillColor = "#58A667";
			else if ( climate == 4 ) fillColor = "#A0D797";
			else if ( climate == 3 ) fillColor = "#FFE183";
			else if ( climate == 2 ) fillColor = "#FF856E";
			else if ( climate == 1 ) fillColor = "#C43948";
			else fillColor = "#888888";}
		///the return line below is passed to style the polygons
		return { color: "WhiteSmoke", weight: 1, fillColor: fillColor, fillOpacity: .8 }; 
	}
```

With colorMap defined, the map will look like this:

![](https://github.com/johnkeltz/aps-enrollment-map/blob/master/images/Map%20with%20polygons.PNG)

## Add tooltips

Next, add the **mapTips** function, which is called by **onEachFeature**. This adds a tooltip to each polygon. Notice that we're still using data from our geoJSON file loaded above.

```javascript
function mapTips(feature, layer ){

	//Write message about each school's enrollment options
	var message
	if(feature.properties.enrollment == "none"){message = "Did not offer administrative transfer in 2018."} 
	else if(feature.properties.enrollment == "some_at"){message = "Accepted administrative transfers in some grades in 2018."}
	else if(feature.properties.enrollment == "at"){message = "Accepted administrative transfers in all grades in 2018."}
	else if(feature.properties.enrollment == "charter"){message = "See below for charter enrollment information."}
	else if(feature.properties.enrollment == "open"){message = "See below for single gender enrollment information."}

	//Style each performance data point- rounding, missing data, etc...
	var ccrpi_text
	if(feature.properties.ccrpi_score){ccrpi_text = Math.round(feature.properties.ccrpi_score*10)/10}
	else{ccrpi_text = "No score."};

	var miles_text
	if(feature.properties.milestones){miles_text = Math.round(feature.properties.milestones*100) + "%"}
	else{miles_text = "No score."};

	var growth_text
	if(feature.properties.sgp){growth_text = Math.round(feature.properties.sgp*100) + "%"}
	else{growth_text = "No score."};

	var climate_text
	if(feature.properties.star_rating){climate_text = feature.properties.star_rating + " out of 5"}
	else{climate_text = "No score."};

	//write the tooltip text in html
	layer.bindPopup( "<strong><a href=" + feature.properties.link + " target='_blank'>" + feature.properties.school + "</a></strong><br/>"
	+ "CCRPI 3-Year Average: " + "<strong>" + ccrpi_text + "</strong><br/>"
	+ "Milestones Proficiency: " + "<strong>" + miles_text + "</strong><br/>"
	+ "Milestones Growth: " + "<strong>" + growth_text + "</strong><br/>"
	+ "Climate Stars: " + "<strong>" + climate_text + "</strong><br/>"
	+ message
	)
}
```

Now we have tooltips:

![](https://github.com/johnkeltz/aps-enrollment-map/blob/master/images/Map%20Tooltips.PNG)

## Add points

We also need to add points for schools that don't have traditional school zones. Notice that this code is able to use the same functions as the polygons- **colorMap** and **mapTips**.

```javascript
$.getJSON("https://apsinsights.org/documents/2018/05/enrollment-map-school-points.txt/",function(points){
	mapPoints = L.geoJson(points, {
		pointToLayer: function(feature,latlng){
			return L.circleMarker(latlng,{radius:9});
		},
		style: colorMap,
		onEachFeature: mapTips,
		filter: function(feature){
			if(feature.properties.level == "E"){return true}
		}
	}).addTo(performMap);
})
```

Now the map has shapes and points:

![](https://github.com/johnkeltz/aps-enrollment-map/blob/master/images/Map%20with%20points.PNG)

## Add legend and info button

Next we'll add a color legend and an info button using leaflet's [control](https://leafletjs.com/reference-1.3.2.html#control) class. These features are added in Leaflet, but mostly written in html using "div.innerHTML".

```javascript
//make color legend
var legend = L.control({position: 'topright'});
legend.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info')
	div.innerHTML =
		'CCRPI<br>3-year<br>average<br><i class="fa fa-square" style="color:#58A667"></i> >90<br><i class="fa fa-square" style="color:#72C282"></i> 80-89<br><i class="fa fa-square" style="color:#A0D797"></i> 70-79<br><i class="fa fa-square" style="color:#FFE183"></i> 60-69<br><i class="fa fa-square" style="color:#FF856E"></i> 50-59<br><i class="fa fa-square" style="color:#C43948"></i> <50<br>'
	return div;
};
legend.addTo(performMap);

//make info button
var infoButton = L.control({position: 'bottomleft'});
infoButton.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'infoButton')
	div.innerHTML =
		"<span class='w3-tooltip'><img src='https://apsinsights.org/wp-content/uploads/2018/05/info-button.png' height='30' width='30'><div class='w3-text w3-light-gray w3-small w3-border w3-round-large' style='position:absolute; bottom:25px; left:1px; width:300px; z-index:1000; text-align:left; padding:4px 8px;'>The map is color-coded by each school's <strong>CCRPI three-year average</strong>. The three-year average is used because CCRPI fluctuates from year to year and the three-year average is more predictive of future performance.<br><br> Tap or click a school to view additional indicators:<br> -2017 Milestones <b>proficiency</b> (average of reading and math).<br>-3-year average of the percentage of students with typical or high <b>growth</b>, which uses the state's student growth percentile results.<br>-State <b>climate</b> star ratings.</div></span>"
	return div;
};
infoButton.addTo(performMap);
```

The info button gives information on hover, and uses the [w3.css library](https://www.w3schools.com/w3css/) to make and style the tooltip. The w3.css library uses class names like, "w3-tooltip" to assign styles.

To style to color legend, we use the div name for the color legend (the color legend's div name is "info") to add css.

```css
.info, .colorButton{
	padding: 6px 8px;
	/*font: 14px/16px Arial, Helvetica, sans-serif;*/
	background: white;
	background: rgba(255,255,255,0.8);
	box-shadow: 0 0 15px rgba(0,0,0,0.2);
	border-radius: 5px;
}
```

Now we have a color legend and a hover info button:

![](https://github.com/johnkeltz/aps-enrollment-map/blob/master/images/Hover%20button%20example.gif?raw=true)

## Add color filter

First, we'll add the menu, similarly to how we added the last two features. It uses the same css as the color legend above.

```javascript
var colorButton = L.control({position: 'bottomright'});
colorButton.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'colorButton')
	div.innerHTML =
		'Color by:<div class="selectDiv"><select id="colorSelect" class="kickoff"><option value="CCRPI">CCRPI</option><option value="Milestones">Milestones</option><option value="Growth">Growth</option><option value="Climate">Climate</option></select></div>'
	return div;
};
colorButton.addTo(performMap);
```

Notice the color filter hass class name "kickoff". We then use any change to the kickoff class (i.e. a filter selection) to trigger the code below. The code below redraws the color key, shapes, and points according to the filter selection.

```javascript
$('.kickoff').on('change', function() {
	
	//get filter value
	metric = ($('#colorSelect').val())

	//drop current shapes and points
	mapFill.remove(performMap)
	mapPoints.remove(performMap)

	//write new color key
	if(metric == 'CCRPI'){
		$(".info").html('CCRPI<br>3-year<br>average<br><i class="fa fa-square" style="color:#58A667"></i> >90<br><i class="fa fa-square" style="color:#72C282"></i> 80-89<br><i class="fa fa-square" style="color:#A0D797"></i> 70-79<br><i class="fa fa-square" style="color:#FFE183"></i> 60-69<br><i class="fa fa-square" style="color:#FF856E"></i> 50-59<br><i class="fa fa-square" style="color:#C43948"></i> <50<br>')
	}
	else if(metric=='Milestones'){
		$(".info").html('Milestones<br>Proficiency<br><i class="fa fa-square" style="color:#58A667"></i> >75%<br><i class="fa fa-square" style="color:#72C282"></i> 60-74%<br><i class="fa fa-square" style="color:#A0D797"></i> 45-59%<br><i class="fa fa-square" style="color:#FFE183"></i> 30-44%<br><i class="fa fa-square" style="color:#FF856E"></i> 15-29%<br><i class="fa fa-square" style="color:#C43948"></i> <15%<br>')
	}
	else if(metric=='Growth'){
		$(".info").html('Growth<br>3-year<br>average<br><i class="fa fa-square" style="color:#58A667"></i> >75%<br><i class="fa fa-square" style="color:#72C282"></i> 70-74%<br><i class="fa fa-square" style="color:#A0D797"></i> 65-69%<br><i class="fa fa-square" style="color:#FFE183"></i> 60-64%<br><i class="fa fa-square" style="color:#FF856E"></i> 55-59%<br><i class="fa fa-square" style="color:#C43948"></i> <55%<br>')
	}
	else if(metric=='Climate'){
		$(".info").html('Climate<br>Stars<br><i class="fa fa-square" style="color:#58A667"></i> 5<br><i class="fa fa-square" style="color:#A0D797"></i> 4<br><i class="fa fa-square" style="color:#FFE183"></i> 3<br><i class="fa fa-square" style="color:#FF856E"></i> 2<br><i class="fa fa-square" style="color:#C43948"></i> 1<br>')
	}

	//redraw shapes
	$.getJSON("https://apsinsights.org/documents/2018/05/enrollment-map-elementary-zones.txt",function(zones){
		mapFill = L.geoJson(zones, {		
			style: colorMap,				
			onEachFeature: mapTips
		}).addTo(performMap); 

		mapFill.bringToBack();
	})

	//redraw points
	$.getJSON("https://apsinsights.org/documents/2018/05/enrollment-map-school-points.txt/",function(points){

		mapPoints = L.geoJson(points, {

			pointToLayer: function(feature,latlng){
				marker = L.circleMarker(latlng,{radius:9});
				return marker;
			},
			style: colorMap,
			onEachFeature: mapTips, 
			filter: function(feature){
				if(feature.properties.level == 'E'){return true}
			}
		}).addTo(performMap);	
	})	
})
```

Now we have a working color filter:

![](https://github.com/johnkeltz/aps-enrollment-map/blob/master/images/Enrollment%20map%20color%20switch.gif)
