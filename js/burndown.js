var header = ['Date', 'Total Scope', 'Open', 'Track'];
var actualStartDate = "2012-07-14";
var actualEndDate = "2012-08-31";
var products = {"Core": "Platform", "gaia": "Gaia", "Marketplace": "Marketplace", "Boot2Gecko": "Boot2Gecko", "Other": "Other"}; 
var today = new Date(Date.now());
var issueDate = {}; 
var productIssueDate = {};

function createBurndownChart(){
	$(document).on("alldatain", drawBurndownChart);
	$(document).on("alldatain", drawProductBurndownCharts);
	$(document).on("alldatain", calculateFindFixRates);
}

function drawBurndownChart() {
	var data = [];
	data[0] = header;
		
	var date = new Date(startDate);
	var endDate = new Date(actualEndDate);
	endDate.setDate(endDate.getDate()+2);
	var i = 1;
	while(date.getTime() < endDate.getTime()){
		var dateString = getDateAsString(date);
		
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
			var dateString = getDateAsString(date);
			
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

function calculateFindFixRates(){
	var rateDiv = document.getElementById("rate_div");
	var endDate = new Date(Date.now());
	var endDateString = getDateAsString(endDate);

	for (var product in products) {
		while(productIssueDate[product][endDateString] === undefined){
			endDate.setDate(endDate.getDate()-1);
			endDateString = getDateAsString(endDate);
		}
	    break;
	}
	var startDate = new Date();
	startDate.setDate(endDate.getDate()-7);
	var startDateString = getDateAsString(startDate);

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
