# APS Enrollment Map: How-To

This page has both a school lookup tool and performance color coding. The page is built in Javascript and uses [Leaflet.js](https://leafletjs.com/) for mapping. Read-on to learn how to build it:

##Create Map

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
	
	performMap.on('tileerror', function(error, tile) {
		console.log(error);
		console.log(tile);
		alert("Fail")
	});

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
		attribution: '<a href="http://openstreetmap.org">OpenStreetMap</a> | <a href="http://mapbox.com">Mapbox</a>',
		maxZoom: 18,
		id: 'mapbox.streets-basic', //see free options here: https://www.mapbox.com/api-documentation/#maps
		accessToken: 'your.mapbox.access.token', //enter your mapbox access token here
	}).addTo(performMap);
```

The map will look  something like this:

![](https://github.com/johnkeltz/aps-enrollment-map/blob/master/images/Initialize%20Map.PNG)

##Add Polygons

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

##Add tooltips

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

![](https://github.com/johnkeltz/aps-enrollment-map/blob/master/images/Map%20Tooltip.PNG?raw=true)


