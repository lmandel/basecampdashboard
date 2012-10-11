var TOTAL_SCOPE_NOTE = "Total Scope = All issues flagged as blocking-basecamp+ (open+closed)";
var OPEN_NOTE = "Open = All open blocking-basecamp+ issues in Bugzilla+Github";
var OTHER_PRODUCTS_NOTE = "Other = ";
var PRODUCTS_ORDERED = ['Platform', 'Gaia', 'Marketplace', 'Other'];

var tableIgnoreCols = ['url', 'patch', 'feature'];

function createBurndownChart(){
	$(document).on("datarollupcomplete", reportLastUpdated);
	$(document).on("datarollupcomplete", drawBurndownChart);
	$(document).on("datarollupcomplete", drawProductBurndownCharts);
	$(document).on("datarollupcomplete", addChartNotes);
	$(document).on("datarollupcomplete", calculateFindFixRates);
	$(document).on("datarollupcomplete", populateBugTable);
}

function reportLastUpdated(){
	var lastUpdatedDiv = $("#lastUpdated");
	lastUpdatedDiv.append("Data last updated " + latestDataDate);
}

function drawBurndownChart() {
	var data = [];
	data[0] = getHeader();
		
	var date = new Date(startDate);
	var endDate = new Date(latestDataDate);
	endDate.setDate(endDate.getDate()+1);
	if(showTrack){
		endDate = new Date(actualEndDate);
	}
	endDate.setDate(endDate.getDate()+2);
	var i = 1;
	while(date.getTime() < endDate.getTime()){
		var dateString = getDateAsString(date);
		
		if(totalIssueRollupByDate[dateString] === undefined){
			data[i] = [dateString, null, null];
			if(showTrack){
				data[i].push(null);
			}
			if(showTrack && dateString == actualEndDate){
				data[i] = [actualEndDate, null, null, 0];
			}
		}
		else{
			data[i] = totalIssueRollupByDate[dateString];
			
		}
		date.setDate(date.getDate()+1);
		i++;
	}
    var chartData = google.visualization.arrayToDataTable(data);
        
    var options = {
      title: 'Basecamp Burndown', 
      interpolateNulls: true,
      height: 432,
      width: 608,
      chartArea: {left:70,top:40,width:"85%",height:"70%"},
      legend: {position: 'in'},
      vAxis: {baseline: 0}
    };
        
    var chartDiv = document.getElementById('chart_div');

    var chart = new google.visualization.LineChart(chartDiv);
    chart.draw(chartData, options);
}

function drawProductBurndownCharts(){
	var productChartDiv = document.getElementById("product_charting_div");
	
	for(var i = 0; i < PRODUCTS_ORDERED.length; i++){
		var product = PRODUCTS_ORDERED[i];
		
		if(productIssueRollupByDate[product] !== undefined){
			var div = document.createElement('div');
			div.setAttribute("class", "productBurndownChart");
			productChartDiv.appendChild(div);
	
			var data = [];
			data[0] = getHeader();
		
			var date = new Date(startDate);
			var endDate = new Date(latestDataDate);
			endDate.setDate(endDate.getDate()+1);
			if(showTrack){
				endDate = new Date(actualEndDate);
			}
			endDate.setDate(endDate.getDate()+2);
			var j = 1;
			while(date.getTime() < endDate.getTime()){
				var dateString = getDateAsString(date);
			
				if(productIssueRollupByDate[product][dateString] === undefined){
					data[j] = [dateString, null, null];
					if(showTrack){
						data[j].push(null);
					}
					if(showTrack && dateString == actualEndDate){
						data[j] = [actualEndDate, null, null, 0];
					}
				}
				else{
					data[j] = productIssueRollupByDate[product][dateString];
				
				}
				date.setDate(date.getDate()+1);
				j++;
			}

			var chartData = google.visualization.arrayToDataTable(data);
        
			var options = {
			  title: product + ' Burndown', 
			  interpolateNulls: true,
			  height:208,
			  width:298,
			  legend: {position: 'none'},
			  hAxis: {textPosition: 'none'},
			  chartArea: {left:30,top:20,width:"95%",height:"85%"},
		      vAxis: {baseline: 0}
			};

			var chart = new google.visualization.LineChart(div);
			chart.draw(chartData, options);
		}
	}
}

function getHeader(){
	if(showTrack){
		return ['Date', 'Total Scope', 'Open Bugs/Issues', 'Track'];
	}
	return ['Date', 'Total Scope', 'Open Bugs/Issues'];
}

function addChartNotes(){
	var chartNotesDiv = $("#chartNotes");
	var p = $("<p>");
	p.append(TOTAL_SCOPE_NOTE);
	chartNotesDiv.append(p);
	p = $("<p>");
	p.append(OPEN_NOTE);
	chartNotesDiv.append(p);
	p = $("<p>");
	var otherNote = OTHER_PRODUCTS_NOTE;
	otherProducts.sort();
	for(var i = 0; i < otherProducts.length; i++){
		otherNote += otherProducts[i];
		if(i != otherProducts.length-1){
			otherNote += ", ";
		}
	}
	p.append(otherNote);
	chartNotesDiv.append(p);
}
function calculateFindFixRates(){
	var rateDiv = document.getElementById("rate_div");
	var endDate = new Date(latestDataDate);
	endDate.setDate(endDate.getDate()+1);
	var endDateString = getDateAsString(endDate);

	var productsSorted = PRODUCTS_ORDERED.sort();
	for (var i = 0; i < productsSorted.length; i++) {
		var product = productsSorted[1];
		while(productIssueRollupByDate[product][endDateString] === undefined){
			endDate.setDate(endDate.getDate()-1);
			endDateString = getDateAsString(endDate);
		}
	    break;
	}
	var startDateForFindFix = new Date(endDateString);
	startDateForFindFix.setDate(endDate.getDate()-7);
	var startDateString = getDateAsString(startDateForFindFix);

	if(new Date(startDate) > startDateForFindFix){
		var div = document.createElement('div');
		div.setAttribute("class", "findfixrate");
		div.innerHTML = "At least 7 days of data are required to calculate the find/fix rate";
		rateDiv.appendChild(div);
		return;
	}
	for(var product in productIssueRollupByDate){
		if(productIssueRollupByDate[product] === undefined){
			continue;
		}
		var endDateTotal = productIssueRollupByDate[product][endDateString][1];
		var endDateOpen = productIssueRollupByDate[product][endDateString][2];
		var startDateTotal = productIssueRollupByDate[product][startDateString][1];
		var startDateOpen = productIssueRollupByDate[product][startDateString][2];

		var find = endDateTotal - startDateTotal;
		var fix = (endDateTotal - endDateOpen) - (startDateTotal - startDateOpen);
		
		var rate = Math.round((find/fix)*100)/100;
		if(fix == 0) {
			rate = 0;
		}
		var div = document.createElement('div');
		div.setAttribute("class", "findfixrate");
		div.innerHTML = product + ": " +rate;
		rateDiv.appendChild(div);
	}
}

function populateBugTable(){
	var issueTableDiv = $('#issue_table_div');
	var issueTable = $("<table>");
	issueTable.attr("id","bugTable");
	issueTable.attr("class","bugtable");
	issueTableDiv.append(issueTable);
	
	var cols = [];
	var bugs = $.extend([], bugData[latestDataDate]);
	var bugCols = bugs.shift();
	for(var i = 0; i < bugCols.length; i++){
		var col = bugCols[i];
		if(tableIgnoreCols.indexOf(col) != -1){
			cols.push({"sTitle": col,
				       "bSearchable": false,
					   "bVisible":    false});
		}
		else{
			if(col == "id"){
				cols.push({"sTitle": col,
				"fnRender": function(obj) {
					var sReturn = obj.aData[ obj.iDataColumn ];
					var url = obj.aData[2];
					sReturn = "<a href=\"" + url + "\">" + sReturn + "</a>";
					return sReturn;
				}});
			}
			else if(col == "title"){
				cols.push({"sTitle": col,
				"fnRender": function(obj) {
					var sReturn = obj.aData[ obj.iDataColumn ];
					sReturn = sReturn.replace("<", "&lt;", "g");
					sReturn = sReturn.replace(">", "&gt;", "g");
					return sReturn;
				}});
			}	
			else{
				cols.push({"sTitle": col});
			}
		}
	}
	
	$('#bugTable').dataTable( {
		"aaData": bugs,
		"aoColumns": cols
	} );	
}
