var header = ['Date', 'Total Scope', 'Open Basecamp+', 'Track'];
var actualStartDate = "2012-07-14";
var actualEndDate = "2012-08-31";
var startDate = "2012-07-15";
var products = {"Core": "Platform", "gaia": "Gaia", "Marketplace": "Marketplace", "Boot2Gecko": "Boot2Gecko", "Other": "Other"}; 
var today = new Date(Date.now());
var issueDate = {}; 
var productIssueDate = {};

function createBurndownChart(){
	var date = new Date(startDate);
	while (date.getTime() < today.getTime()){
		var year = date.getFullYear();
		var month = date.getMonth()+1;
		if (month < 10){
			month = "0" + month;
		}
		var day = date.getDate();
		if(day < 10){
			day = "0" + day;
		}
		var dateString = year + "-" + month + "-" + day;
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
			var year = date.getFullYear();
			var month = date.getMonth()+1;
			if (month < 10){
				month = "0" + month;
			}
			var day = date.getDate();
			if(day < 10){
				day = "0" + day;
			}
			var dateString = year + "-" + month + "-" + day;
			
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
          title: 'Basecamp Burndown', interpolateNulls: true
        };

        var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
        chart.draw(chartData, options);
        
        drawProductBurndownCharts();
	}
}

function drawProductBurndownCharts(){
	var productChartDiv = document.getElementById("product_charting_div");
	for(var product in products){
		var div = document.createElement('div');
		div.setAttribute("class", "productBurndownChart");
		productChartDiv.appendChild(div);
	
		var data = [];
		data[0] = ['Date', 'Total Scope', 'Open basecamp+', 'Track'];
		
		var date = new Date(startDate);
		var endDate = new Date(actualEndDate);
		endDate.setDate(endDate.getDate()+2);
		var i = 1;
		while(date.getTime() < endDate.getTime()){
			var year = date.getFullYear();
			var month = date.getMonth()+1;
			if (month < 10){
				month = "0" + month;
			}
			var day = date.getDate();
			if(day < 10){
				day = "0" + day;
			}
			var dateString = year + "-" + month + "-" + day;
			
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
	while(date.getTime() < today.getTime()){
		var year = date.getFullYear();
		var month = date.getMonth()+1;
		if (month < 10){
			month = "0" + month;
		}
		var day = date.getDate();
		if(day < 10){
			day = "0" + day;
		}
		var dateString = year + "-" + month + "-" + day;
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
	var lines = data.split(/\r\n|\n/);

	var issueCount = 0;
	var openIssueCount = 0;
	var productIssueCount = {};
	var productOpenIssueCount = {};
	
	for(var i = 1; typeof lines[i] !== undefined && lines[i] != ""; i++){
		var lineData = lines[i].split(',');
		var product;
		if(lineData[5].charAt(0) != "\""){
			product = lineData[6];
		}
		else{
			//alert("in else " + lineData[5]);
			var j = 0;
			while(lineData[5+j].charAt(lineData[5+j].length-1) != "\""){
				j++;
				if(j == 20){
					alert("breaking");
					break;
				}
			}
			product = lineData[6+j];
		}
		if(products[product] === undefined){
			product = "Other";
		}
		if(product.indexOf('"') > -1){
			product = lineData[7];
		}
		if(lineData[4] == "open"){
			openIssueCount++;
			if(productOpenIssueCount[product] === undefined){
				productOpenIssueCount[product] = 0;
			}
			productOpenIssueCount[product]++;
		}
		issueCount++;
		if(productIssueCount[product] === undefined){
			productIssueCount[product] = 0;
		}
		productIssueCount[product]++;
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