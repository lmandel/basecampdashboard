var header = ['Date', 'Total Scope', 'Open', 'Track'];
var actualStartDate = "2012-07-14";
var actualEndDate = "2012-08-31";
var startDate = "2012-07-15";
var products = {"Core": "Platform", "gaia": "Gaia", "Marketplace": "Marketplace", "Boot2Gecko": "Boot2Gecko", "Other": "Other"}; 
var today = new Date(Date.now());
var issueDate = {}; 
var productIssueDate = {};

function createBurndownChart(){
	var date = new Date(startDate);
	date.setHours(0, 0, 0, 0);
	while (date.getTime() < today.getTime()){
		var dateString = getDateString(date);
		getDataForDate(dateString);
		date.setDate(date.getDate()+1);
	}
}

function drawBurndownChart() {
	if(dataIsInForAllDates()){
		var data = [];
		data[0] = header;
		
		var date = new Date(startDate);
		var endDate = new Date(actualEndDate);
		endDate.setDate(endDate.getDate()+2);
		var i = 1;
		while(date.getTime() < endDate.getTime()){
			var dateString = getDateString(date);
			
			if(issueDate[dateString] === undefined){
				data[i] = [dateString, null, null, null];
				if(dateString == actualEndDate){
					data[i] = [actualEndDate, null, null, 0];
				}
			}
			else{
				data[i] = issueDate[dateString];
				
			}
			date.setDate(date.getDate()+1);
			i++;
		}
        var chartData = google.visualization.arrayToDataTable(data);
        //chartData.addRow(["2012-08-31", null, null, 0]);
        
        var options = {
          title: 'Basecamp Burndown', 
          interpolateNulls: true,
          height: 398,
          width: 608,
          chartArea: {left:70,top:40,width:"85%",height:"70%"},
          legend: {position: 'in'}
        };
        
        var chartDiv = document.getElementById('chart_div');

        var chart = new google.visualization.LineChart(chartDiv);
        chart.draw(chartData, options);
        
        drawProductBurndownCharts();
        calculateFindFixRates();
	}
}

function drawProductBurndownCharts(){
	var productChartDiv = document.getElementById("product_charting_div");
	for(var product in products){
		var div = document.createElement('div');
		div.setAttribute("class", "productBurndownChart");
		productChartDiv.appendChild(div);
	
		var data = [];
		data[0] = header;
		
		var date = new Date(startDate);
		var endDate = new Date(actualEndDate);
		endDate.setDate(endDate.getDate()+2);
		var i = 1;
		while(date.getTime() < endDate.getTime()){
			var dateString = getDateString(date);
			
			if(productIssueDate[product][dateString] === undefined){
				data[i] = [dateString, null, null, null];
				if(dateString == actualEndDate){
					data[i] = [actualEndDate, null, null, 0];
				}
			}
			else{
				data[i] = productIssueDate[product][dateString];
				
			}
			date.setDate(date.getDate()+1);
			i++;
		}
        var chartData = google.visualization.arrayToDataTable(data);
        //chartData.addRow(["2012-08-31", null, null, 0]);
        
        var options = {
          title: products[product] + ' Burndown', 
          interpolateNulls: true,
          height:208,
          width:298,
          legend: {position: 'none'},
          hAxis: {textPosition: 'none'},
          chartArea: {left:30,top:20,width:"95%",height:"85%"}
        };

        var chart = new google.visualization.LineChart(div);
        chart.draw(chartData, options);
	}
	
}

function dataIsInForAllDates(){
	var date = new Date(startDate);
	date.setHours(0, 0, 0, 0);
	while(date.getTime() < today.getTime()){
		var dateString = getDateString(date);
		if(issueDate[dateString] === undefined){
			return false;
		}
		date.setDate(date.getDate()+1);
	}
	return true;
}

function getDataForDate(date){
	var urlbase = "data/";
	var url = urlbase + date + ".csv";
	$.ajax({
		  url: url,
		  crossDomain:true, 
		  dataType: 'text',
		  success: function(data){
		    parseDataForDate(date, data);
		  },
		  error: function(jqXHR, textStatus, errorThrown){
		    //alert('Uh oh. I couldn\'t find any bug/issue data for ' + url + '. ' + errorThrown);
			setEmptyDataForDate(date);
		  }
		});
}

function parseDataForDate(date, data){
	var csvData = parseCSVData(data);
	//var lines = data.split(/\r\n|\n/);
	
	var issueCount = 0;
	var openIssueCount = 0;
	var productIssueCount = {};
	var productOpenIssueCount = {};
	
	for(var i = 1; i < csvData.length; i++){
		var product = csvData[i][6];
		if(products[product] === undefined){
			product = "Other";
		}
		
		issueCount++;
		if(productIssueCount[product] === undefined){
			productIssueCount[product] = 0;
		}
		productIssueCount[product]++;
		
		if(csvData[i][4] == "open"){
			openIssueCount++;
			if(productOpenIssueCount[product] === undefined){
				productOpenIssueCount[product] = 0;
			}
			productOpenIssueCount[product]++;
		}
		
	}
	issueDate[date] = [date, issueCount, openIssueCount, null];
	if(date == actualStartDate){
		issueDate[date][3] = openIssueCount;
	}
	for(var product in productIssueCount){
		if(productIssueDate[product] === undefined){
			productIssueDate[product] = {};
		}
		productIssueDate[product][date] = [date, productIssueCount[product], productOpenIssueCount[product], null];
		
		if(date == actualStartDate){
			productIssueDate[product][date][3] = productOpenIssueCount[product];
		}
	}
	
	
	drawBurndownChart();
}

function setEmptyDataForDate(date){
	issueDate[date] = [date,null,null,null];
	drawBurndownChart();
}

function calculateFindFixRates(){
	var rateDiv = document.getElementById("rate_div");
	var endDate = new Date(Date.now());
	var endDateString = getDateString(endDate);

	for (var product in products) {
		while(productIssueDate[product][endDateString] === undefined){
			endDate.setDate(endDate.getDate()-1);
			endDateString = getDateString(endDate);
		}
	    break;
	}
	var startDate = new Date();
	startDate.setDate(endDate.getDate()-7);
	var startDateString = getDateString(startDate);

	for(var product in products){
		var endDateTotal = productIssueDate[product][endDateString][1];
		var endDateOpen = productIssueDate[product][endDateString][2];
		var startDateTotal = productIssueDate[product][startDateString][1];
		var startDateOpen = productIssueDate[product][startDateString][2];

		var find = endDateTotal - startDateTotal;
		var fix = (endDateTotal - endDateOpen) - (startDateTotal - startDateOpen);
		
		var rate = Math.round((find/fix)*100)/100;
		
		var div = document.createElement('div');
		div.setAttribute("class", "findfixrate");
		div.innerHTML = products[product] + ": " +rate;
		rateDiv.appendChild(div);
	}
}

function getDateString(date){
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	if (month < 10){
		month = "0" + month;
	}
	var day = date.getDate();
	if(day < 10){
		day = "0" + day;
	}
	return year + "-" + month + "-" + day;
}