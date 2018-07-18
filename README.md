# APS Enrollment Map: How-To

This page has both a school lookup tool and performance color coding. The page is built in Javascript and uses [Leaflet.js](https://leafletjs.com/) for mapping. Read-on to learn how to build it:

Start by [initiallizing a Leaflet map](https://leafletjs.com/examples/quick-start/):

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

Next, upload school zone shapes as a geojson file and use the Leaflet function [GeoJSON](https://leafletjs.com/reference-1.3.2.html#geojson) to plot:

```javascript
	$.getJSON("https://apsinsights.org/documents/2018/05/enrollment-map-elementary-zones.txt",function(zones){
		mapFill = L.geoJson(zones  , {
			style: colorMap,
			onEachFeature: mapTips
		}).addTo(performMap); 
		mapFill.bringToBack();
	})
```
In the code above, we're passing functions for the **style** and **onEachFeature** options. Style is determined by the function **colorMap**, shown below. ColorMap gives a color to each school shape according to the school's data. Notice that the colorMap function refers to data, such as "feature.properties.ccrpi_score". These data are included in the geojson file that we loaded above.

```javascript
var metric ='CCRPI';

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
		return { color: "WhiteSmoke", weight: 1, fillColor: fillColor, fillOpacity: .8 }; 
	}
```
