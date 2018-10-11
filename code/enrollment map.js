
//update data file names here//
var elemZones = "https://apsinsights.org/documents/2018/05/enrollment-map-elementary-zones.txt"
var midZones = "https://apsinsights.org/documents/2018/05/enrollment-map-middle-zones.txt"
var highZones = "https://apsinsights.org/documents/2018/05/enrollment-map-high-zones.txt"
var schoolPoints = "https://apsinsights.org/documents/2018/07/enrollment-map-school-points-v1.txt"

/*
Code Layout
Section 1: Define Functions
Section 2: address lookup
Section 3: create map, add objects
Section 4: redraw map when a filter is changed
*/

//Section 1: Define Functions

//accordian code
var statusAdmin = 'hidden'

//toggle the Administrative transfer accordian.
function showAdmin(){
	if(statusAdmin=='hidden'){
		$("#textAdmin").css("display","block")
		$("#pmAdmin").text("-")
		statusAdmin='showing'
	} else{
		$("#textAdmin").css("display","none")
		$("#pmAdmin").text("+")
		statusAdmin='hidden'
		}
	}


var statusCharter = 'hidden'
//toggle the charter accordian.
function showCharter(){
	if(statusCharter=='hidden'){
		$("#textCharter").css("display","block")
		$("#pmCharter").text("-")
		statusCharter='showing'
	} else{
		$("#textCharter").css("display","none")
		$("#pmCharter").text("+")
		statusCharter='hidden'
		}
	}
	
var statusGender = 'hidden'
//toggle the single gender accordian.
function showGender(){
	if(statusGender=='hidden'){
		$("#textGender").css("display","block")
		$("#pmGender").text("-")
		statusGender='showing'
	} else{
		$("#textGender").css("display","none")
		$("#pmGender").text("+")
		statusGender='hidden'
		}
	}
	
var statusPrek = 'hidden'
//toggle the pre-k accordian.
function showPrek(){
	if(statusPrek=='hidden'){
		$("#textPrek").css("display","block")
		$("#pmPrek").text("-")
		statusPrek='showing'
	} else{
		$("#textPrek").css("display","none")
		$("#pmPrek").text("+")
		statusPrek='hidden'
		}
	}



var metric ='CCRPI';
/**
*This function determines map color-coding based on the selected metric.
*@memberof Map_Functions
*@param {Object} feature school data from the geojson file (this is passed automatically)
*@returns {Object} an object with leaflet path options to style the school shapes or point
*/
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

/**
*This function makes the tooltip for each school shape or point.
*@memberof Map_Functions
*@param {Object} feature school data from the geojson file (this is passed automatically)
*@param {String} layer the layer where tooltips will be located (this is passed automatically)
*@returns {Object} an object with leaflet path options to style the school shapes or point
*/
function mapTips(feature, layer ){

	var message
	if(feature.properties.school == "Harper-Archer"){message = "School is phasing out. 6th and 7th grade students attend Invictus Academy in 2018-2019."} 
	else if(feature.properties.enrollment == "none"){message = "Did not offer administrative transfer in 2018."} 
	else if(feature.properties.enrollment == "some_at"){message = "Accepted administrative transfers in some grades in 2018."}
	else if(feature.properties.enrollment == "at"){message = "Accepted administrative transfers in all grades in 2018."}
	else if(feature.properties.enrollment == "charter"){message = "See below for charter enrollment information."}
	else if(feature.properties.enrollment == "open"){message = "See below for single gender enrollment information."}
	
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

	layer.bindPopup( "<strong><a href=" + feature.properties.link + " target='_blank'>" + feature.properties.school + "</a></strong><br/>"
	+ "CCRPI 3-Year Average: " + "<strong>" + ccrpi_text + "</strong><br/>"
	+ "Milestones Proficiency: " + "<strong>" + miles_text + "</strong><br/>"
	+ "Milestones Growth: " + "<strong>" + growth_text + "</strong><br/>"
	+ "Climate Stars: " + "<strong>" + climate_text + "</strong><br/>"
	+ message
	)
}

//counter so we know when to drop old pins
use = 0;
use1 = 0;

var level = "0"

//This function sets the grade level based on the user's selection
function filterLevel(){
	level = document.getElementById("levelFilter").value
	//if(use>0){schoolMarker.remove(performMap)}
}

//Section 2: address lookup

//use select2 to lookup address
$('.addressSelect').select2({
	placeholder:"Enter student's address",
	width: "220px",
	ajax: {
		url: 'https://maps.apsk12.org/db_autocomplete.aspx', //https://maps.apsk12.org/ https://apps-qa.apsk12.org/AddressLocator/
		dataType: 'json',
		processResults: function(data) {
		
			//blank out the old selection. otherwise a new choice with the same index as the old choice doesn't update		
			if(use>0){$(".addressSelect").text('')}
		
			const results = [];
			data.forEach(function makeResults(element, index) {
		  
				results.push({
					id: index,
					text: element.value
				});
			});
		  
		  return {
			results: results
		  };
		  
		}
	}			
});

//once address is selected, find location and school
$(".ajaxFire").change(function(){

//only run if an address has been selected. i.e. don't run if only level filter has been selected
if($(".addressSelect").text()){
	
	var address = $(".addressSelect").text() //$(this).find("option:selected").text();
		//first call finds lat long for address and school number
		$.ajax({
		  url: `https://maps.apsk12.org/db_addrLatLon.aspx?aterm=${address}`, //https://maps.apsk12.org/
		  type: 'GET',
		  data: {
			format: 'json'
		  },
		  success: function(response) {
			
			var obj = JSON.parse(response);
			
			lat = obj[5].value
			longi = obj[4].value
			schoolNumber = obj[level].value //select 0,1, or 2 based on elem filter
			address = obj[3].value
			  
			//second call uses school number to find school name
			$.ajax({
				url: `https://maps.apsk12.org/db_schoollocation.aspx?sterm=${schoolNumber}`, //https://maps.apsk12.org/
				type: 'GET',
				data: {
					format: 'json'
				},
				success: function(response2) {
					
					var obj2 = JSON.parse(response2);
					
						for (i = 0; i < obj2.length; i++) { 

						schoolLat = obj2[i].longitude
						schoolLong = obj2[i].latitude
						school = obj2[i].label
						schoolAddress = obj2[i].Address
						schoolPhone = obj2[i].phone
						schoolWebsite = obj2[i].WebAddress
							
						if(school=='Harper-Archer (Grades 7 & 8)'){school='Harper-Archer (Grade 8)'}
						if(school=='John Lewis Invictus Academy (Grade 6)'){school='Invictus Academy (Grades 6 & 7)'}

						var homeIcon = L.icon({
							iconUrl: "https://apsinsights.org/wp-content/uploads/2018/05/home-pin-32.png",
							iconSize:     [32, 32],
							iconAnchor:  [16,32],
							popupAnchor:  [0, -32]
						});

						var schoolIcon = L.icon({
							iconUrl: "https://apsinsights.org/wp-content/uploads/2018/05/school-pin-purple-32.png",
							iconSize:     [32, 32],
							iconAnchor:  [16,32],
							popupAnchor:  [0, -32]
						});
							
						if(i==0){
							if(use > 0){homeMarker.remove(performMap)}
							homeMarker = L.marker([lat, longi],{icon: homeIcon}).addTo(performMap).bindPopup("<span class = 'notranslate'>" + address + "</span>");
							
							if(use > 0){schoolMarker1.remove(performMap)}
							schoolMarker1 = L.marker([schoolLat, schoolLong],{icon: schoolIcon}).addTo(performMap).bindPopup("<span class = 'notranslate'><b>" + school + "</b><br>" + schoolAddress + "</span><br>" + schoolPhone + "<br><a href=" + schoolWebsite + " target='_blank'>School Website</a>");	
							schoolMarker1.openPopup()
						}

						if(typeof schoolMarker2 !== 'undefined'){schoolMarker2.remove(performMap)}
							
						if(i==1){
							schoolMarker2 = L.marker([schoolLat, schoolLong],{icon: schoolIcon}).addTo(performMap).bindPopup("<span class = 'notranslate'><b>" + school + "</b><br>" + schoolAddress + "</span><br>" + schoolPhone + "<br><a href=" + schoolWebsite + " target='_blank'>School Website</a>");
							schoolMarker2.openPopup()				
						}

						use++;
					}	
				},
				error: function() {
					$('#errors').text("There was an error processing your request. Please try again.")
				}
			});
			
		  },
		  error: function() {
			$('#errors').text("There was an error processing your request. Please try again.")
		  }
		});
	} 
})


//Section 3: create map, add objects

//create map
var performMap = L.map('mapid').setView([33.77, -84.41], 11);

performMap.on('tileerror', function(error, tile) {
	console.log(error);
	console.log(tile);
	alert("Fail")
});

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	attribution: '<a href="http://openstreetmap.org">OpenStreetMap</a> | <a href="http://mapbox.com">Mapbox</a>',
	maxZoom: 18,
	id: 'mapbox.streets-basic', //mapbox.high-contrast mapbox.streets-basic mapbox.streets mapbox.light mapbox.satellite https://www.mapbox.com/api-documentation/#maps
	accessToken: 'pk.eyJ1IjoiYXBzaW5zaWdodHMiLCJhIjoiY2pnbWg1M2p1MWZkMTJxdDRyb2V3MHFnaCJ9.omixjpQAm1hZvzDfcZQ70A',
}).addTo(performMap);

var mapFill
var mapPoints

//add shapes
$.getJSON(elemZones,function(zones){
	mapFill = L.geoJson(zones  , {
		style: colorMap,
		onEachFeature: mapTips
	}).addTo(performMap); 
	mapFill.bringToBack();
})

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

//make color option
var colorButton = L.control({position: 'bottomright'});
colorButton.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'colorButton')
	div.innerHTML =
		'Color by:<div class="selectDiv"><select id="colorSelect" class="kickoff"><option value="CCRPI">CCRPI</option><option value="Milestones">Milestones</option><option value="Growth">Growth</option><option value="Climate">Climate</option></select></div>'
	return div;
};
colorButton.addTo(performMap);

//use spiderfier to fix overlapping csk/best
var oms = new OverlappingMarkerSpiderfier(performMap);

oms.addListener('spiderfy', function(markers) {
	intentionalErrorToPreventPopup //find the right way to do this...
});	

//add schools without zones as points
$.getJSON(schoolPoints,function(points){
	
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

//Section 4: redraw map when a filter is changed
	//redraw map when level or color by filters change
$('.kickoff').on('change', function() {
	
	var path		
	var level
	
	metric = ($('#colorSelect').val())
	
	if($('#levelFilter').val() == 0){path = elemZones; level = 'E'}
	else if($('#levelFilter').val() == 1){path = midZones; level = 'M'}
	else if($('#levelFilter').val() == 2){path = highZones; level = 'H'}
	
	mapFill.remove(performMap)
	mapPoints.remove(performMap)

	//write new color key
	if(metric == 'CCRPI'){
		//$(".info").html('Hello World')
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
	$.getJSON(path,function(zones){
		mapFill = L.geoJson(zones, {		
			style: colorMap,				
			onEachFeature: mapTips
		}).addTo(performMap); 
		
		mapFill.bringToBack();
	})

	//redraw points
	$.getJSON(schoolPoints,function(points){
	
		mapPoints = L.geoJson(points, {
		
			pointToLayer: function(feature,latlng){
				marker = L.circleMarker(latlng,{radius:9});
				//marker = L.marker(latlng);
				oms.addMarker(marker);
				return marker;
			},
			style: colorMap,
			onEachFeature: mapTips, //use spiderfier here...
			filter: function(feature){
				if(feature.properties.level == level){return true}
			}
		}).addTo(performMap);	
	})	
})
